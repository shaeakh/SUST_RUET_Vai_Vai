"use client";

import { Badge } from "@/components/ui/badge";
import type { Course } from "@/lib/mock-courses";
import { cn } from "@/lib/utils";
import { FolderIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

const MAX_NAME_LENGTH = 20;

function truncate(name: string): string {
  if (name.length <= MAX_NAME_LENGTH) return name;
  return `${name.slice(0, MAX_NAME_LENGTH)}...`;
}

export function CourseCard({ course }: { course: Course }) {
  const displayName = truncate(course.name);
  const isLong = course.name.length > MAX_NAME_LENGTH;

  return (
    <Link
      href={`/course/${course.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-md transition-all hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      )}
      title={isLong ? course.name : undefined}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 bg-muted">
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <HugeiconsIcon
            icon={FolderIcon}
            strokeWidth={1.5}
            className="size-12 opacity-60"
          />
        </div>
        <div className="absolute right-2 top-2">
          <Badge
            variant={course.type === "Lab" ? "default" : "secondary"}
            className="text-xs"
          >
            {course.type}
          </Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="truncate font-medium leading-tight">{displayName}</h3>
        {course.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {course.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary"
              >
                {tag}
              </span>
            ))}
            {course.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{course.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
