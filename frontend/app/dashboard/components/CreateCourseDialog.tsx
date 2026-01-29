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
import { Textarea } from "@/components/ui/textarea";
import {
  createClassroom,
  type Classroom,
  type ClassroomType,
} from "@/lib/api/classroomApi";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import * as React from "react";

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassroomCreated: (classroom: Classroom) => void;
}

const CLASSROOM_TYPES: { value: ClassroomType; label: string }[] = [
  { value: "lab", label: "lab" },
  { value: "theory", label: "theory" },
];

export function CreateCourseDialog({
  open,
  onOpenChange,
  onClassroomCreated,
}: CreateCourseDialogProps) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<ClassroomType | "">("");
  const [description, setDescription] = React.useState("");
  const [errors, setErrors] = React.useState<{
    name?: string;
    type?: string;
    description?: string;
  }>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const reset = React.useCallback(() => {
    setName("");
    setType("");
    setDescription("");
    setErrors({});
    setSubmitError(null);
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
    const next: { name?: string; type?: string; description?: string } = {};
    if (!name.trim()) next.name = "Course name is required.";
    if (!type) next.type = "Course type is required.";
    if (!description.trim()) next.description = "Description is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await createClassroom({
        name: name.trim(),
        type: type as ClassroomType,
        description: description.trim(),
      });
      onClassroomCreated(res.data);
      onOpenChange(false);
      reset();
      router.push(`/course/${res.data.id}`);
    } catch {
      setSubmitError("Failed to create classroom. Please try again.");
      setSubmitting(false);
    }
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
          Create Classroom
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="classroom-name">Course Name</Label>
            <Input
              id="classroom-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Introduction to Machine Learning"
              error={errors.name}
              disabled={submitting}
              aria-required="true"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label id="course-type-label">Course Type</Label>
            <Select
              value={type || null}
              onValueChange={(v) => setType((v ?? "") as ClassroomType | "")}
              disabled={submitting}
              items={CLASSROOM_TYPES}
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
                {CLASSROOM_TYPES.map(({ value, label }) => (
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
            <Label htmlFor="classroom-description">Description</Label>
            <Textarea
              id="classroom-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Anything string"
              disabled={submitting}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-xs font-medium text-red-600">
                {errors.description}
              </p>
            )}
          </div>
          {submitError && (
            <p className="text-sm font-medium text-red-600">{submitError}</p>
          )}
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
              {submitting ? "Creating…" : "Create Classroom"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
