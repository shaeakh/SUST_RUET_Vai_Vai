"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  generateCourseId,
  type Course,
  type CourseType,
} from "@/lib/mock-courses";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import * as React from "react";
import { TagsInput } from "./TagsInput";

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCourseCreated: (course: Course) => void;
}

const COURSE_TYPES: { value: CourseType; label: string }[] = [
  { value: "Lab", label: "Lab" },
  { value: "Theory", label: "Theory" },
];

export function CreateCourseDialog({
  open,
  onOpenChange,
  onCourseCreated,
}: CreateCourseDialogProps) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [courseType, setCourseType] = React.useState<CourseType | "">("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<{
    title?: string;
    type?: string;
  }>({});
  const [submitting, setSubmitting] = React.useState(false);

  const reset = React.useCallback(() => {
    setTitle("");
    setCourseType("");
    setTags([]);
    setErrors({});
    setSubmitting(false);
  }, []);

  React.useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  const validate = (): boolean => {
    const next: { title?: string; type?: string } = {};
    if (!title.trim()) next.title = "Course name is required.";
    if (!courseType) next.type = "Course type is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;
    setSubmitting(true);
    const id = generateCourseId();
    const course: Course = {
      id,
      name: title.trim(),
      type: courseType as CourseType,
      tags: [...tags],
      logo: "/placeholder-icon.svg",
    };
    onCourseCreated(course);
    onOpenChange(false);
    reset();
    router.push(`/course/${id}`);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-course-dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg",
          "animate-in fade-in-0 zoom-in-95 duration-200",
        )}
      >
        <h2
          id="create-course-dialog-title"
          className="text-lg font-semibold tracking-tight"
        >
          Create Course
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course-name">Course Name</Label>
            <Input
              id="course-name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Introduction to Machine Learning"
              error={errors.title}
              disabled={submitting}
              aria-required="true"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label id="course-type-label">Course Type</Label>
            <Select
              value={courseType || null}
              onValueChange={(v) => setCourseType((v ?? "") as CourseType | "")}
              disabled={submitting}
              items={COURSE_TYPES}
            >
              <SelectTrigger
                id="course-type"
                className="w-full"
                aria-labelledby="course-type-label"
                aria-invalid={!!errors.type}
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {COURSE_TYPES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs font-medium text-red-600">{errors.type}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label id="tags-label">Tags</Label>
            <TagsInput
              value={tags}
              onChange={setTags}
              placeholder="e.g. AI, Python, Week 1"
              disabled={submitting}
              aria-label="Tags"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create Course"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
