"use client";

import { Button } from "@/components/Button";
import { listClassrooms, type Classroom } from "@/lib/api/classroomApi";
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
  const [classrooms, setClassrooms] = React.useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listClassrooms();
        if (cancelled) return;
        setClassrooms(res.data);
      } catch {
        if (cancelled) return;
        setClassrooms([]);
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClassroomCreated = React.useCallback((classroom: Classroom) => {
    setClassrooms((prev) => [classroom, ...prev]);
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
          <Button onClick={() => setDialogOpen(true)}>Create Classroom</Button>
        </div>
      </header>

      <CoursesGrid classrooms={classrooms} isLoading={isLoading} />

      <CreateCourseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onClassroomCreated={handleClassroomCreated}
      />
    </div>
  );
}
