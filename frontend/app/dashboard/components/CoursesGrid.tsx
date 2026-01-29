"use client";

import type { Classroom } from "@/lib/api/classroomApi";
import { cn } from "@/lib/utils";
import { CourseCard } from "./CourseCard";

interface CoursesGridProps {
  classrooms: Classroom[];
  isLoading?: boolean;
  className?: string;
}

function CourseCardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
      aria-hidden
    >
      <div className="aspect-16/10 w-full animate-pulse bg-muted" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="flex gap-1">
          <div className="h-5 w-12 animate-pulse rounded bg-muted" />
          <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          <div className="h-5 w-14 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function CoursesGrid({
  classrooms,
  isLoading,
  className,
}: CoursesGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          className,
        )}
        role="status"
        aria-label="Loading classrooms"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (classrooms.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center",
          className,
        )}
      >
        <p className="text-sm font-medium text-muted-foreground">
          No classrooms yet
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Create your first classroom to get started.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {classrooms.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
