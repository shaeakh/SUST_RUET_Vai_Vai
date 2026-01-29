"use client";

import { Badge } from "@/components/ui/badge";
import type { Classroom, ClassroomType } from "@/lib/api/classroomApi";
import type { Course, CourseType } from "@/lib/mock-courses";
import { cn } from "@/lib/utils";
import { FolderIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

const MAX_NAME_LENGTH = 20;

function truncate(name: string): string {
  if (name.length <= MAX_NAME_LENGTH) return name;
  return `${name.slice(0, MAX_NAME_LENGTH)}...`;
}

type CourseCardData =
  | Course
  | (Classroom & {
      logo?: string;
      type?: CourseType | ClassroomType;
      tags?: string[];
    });

function normalizeType(
  raw: CourseType | ClassroomType | undefined,
): { label: "Lab" | "Theory"; isLab: boolean } | null {
  if (!raw) return null;
  if (raw === "Lab" || raw === "lab") return { label: "Lab", isLab: true };
  if (raw === "Theory" || raw === "theory" || raw === "thoery") {
    return { label: "Theory", isLab: false };
  }
  return null;
}

export function CourseCard({ course }: { course: CourseCardData }) {
  const displayName = truncate(course.name);
  const isLong = course.name.length > MAX_NAME_LENGTH;
  const normalized = normalizeType("type" in course ? course.type : undefined);
  const tags =
    "tags" in course && Array.isArray(course.tags) ? (course.tags ?? []) : [];
  const logo = "logo" in course ? course.logo : undefined;

  return (
    <Link
      href={`/course/${course.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-md transition-all hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      )}
      title={isLong ? course.name : undefined}
    >
      <div className="relative aspect-16/10 w-full shrink-0 bg-muted">
        {logo ? (
          <img src={logo} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <HugeiconsIcon
              icon={FolderIcon}
              strokeWidth={1.5}
              className="size-12 opacity-60"
            />
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge
            variant={normalized?.isLab ? "default" : "secondary"}
            className="text-xs"
          >
            {normalized?.label ?? "Classroom"}
          </Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 font-medium leading-tight">
          {displayName}
        </h3>
        {tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
