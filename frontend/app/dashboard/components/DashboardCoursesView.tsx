"use client";

import { Button } from "@/components/Button";
import {
  getInitialCourses,
  persistCourses,
  type Course,
} from "@/lib/mock-courses";
import * as React from "react";
import { CoursesGrid } from "./CoursesGrid";
import { CreateCourseDialog } from "./CreateCourseDialog";

interface DashboardCoursesViewProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}

export function DashboardCoursesView({
  title,
  subtitle,
}: DashboardCoursesViewProps) {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  React.useEffect(() => {
    setCourses(getInitialCourses());
    setIsLoading(false);
  }, []);

  const handleCourseCreated = React.useCallback((course: Course) => {
    setCourses((prev) => {
      const next = [course, ...prev];
      persistCourses(next);
      return next;
    });
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="shrink-0">
          <Button onClick={() => setDialogOpen(true)}>Create Course</Button>
        </div>
      </header>

      <CoursesGrid courses={courses} isLoading={isLoading} />

      <CreateCourseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCourseCreated={handleCourseCreated}
      />
    </div>
  );
}
