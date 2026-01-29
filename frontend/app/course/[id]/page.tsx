"use client";

import { Button } from "@/components/Button";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import {
  generateMockCourseMaterials,
  generateMockPracticalProblems,
  getAllMaterials,
  getCourseMaterials,
  getPracticalProblems,
  getUserAttempts,
  saveCourseMaterials,
  savePracticalProblems,
  type CourseMaterial,
  type CourseMaterialsData,
  type PracticalProblem,
  type PracticalProblemsData,
} from "@/lib/mock-course-data";
import { getInitialCourses } from "@/lib/mock-courses";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import * as React from "react";
import { AddPracticalProblemDialog } from "./components/AddPracticalProblemDialog";
import { AddStudyMaterialsDialog } from "./components/AddStudyMaterialsDialog";
import { IntelligentSearch } from "./components/IntelligentSearch";
import { PracticalProblemView } from "./components/PracticalProblemView";
import { WeekAccordion } from "./components/WeekAccordion";

type LabTab = "study-materials" | "practical";

export default function CourseDetailPage() {
  const params = useParams();
  const { user, isAdmin } = useAuth();
  const id = typeof params.id === "string" ? params.id : "";
  const [course, setCourse] = React.useState<{
    id: string;
    name: string;
    type: "Theory" | "Lab";
  } | null>(null);
  const [courseMaterials, setCourseMaterials] =
    React.useState<CourseMaterialsData | null>(null);
  const [practicalProblems, setPracticalProblems] =
    React.useState<PracticalProblemsData | null>(null);
  const [showAddMaterialsDialog, setShowAddMaterialsDialog] =
    React.useState(false);
  const [showAddProblemDialog, setShowAddProblemDialog] = React.useState(false);
  const [labTab, setLabTab] = React.useState<LabTab>("study-materials");
  const [selectedProblemId, setSelectedProblemId] = React.useState<
    string | null
  >(null);
  const [userAttempts, setUserAttempts] = React.useState<
    Record<string, number>
  >({});

  // Load course data
  React.useEffect(() => {
    if (!id) return;
    const courses = getInitialCourses();
    const foundCourse = courses.find((c) => c.id === id);
    if (foundCourse) {
      setCourse({
        id: foundCourse.id,
        name: foundCourse.name,
        type: foundCourse.type,
      });
    }
  }, [id]);

  // Load course materials
  React.useEffect(() => {
    if (!id) return;
    let materials = getCourseMaterials(id);
    if (!materials) {
      // Generate mock data if not exists
      const courseType = course?.type || "Theory";
      materials = generateMockCourseMaterials(id, courseType);
      saveCourseMaterials(materials);
    }
    setCourseMaterials(materials);
  }, [id, course?.type]);

  // Load practical problems (for Lab courses)
  React.useEffect(() => {
    if (!id || course?.type !== "Lab") return;
    let problems = getPracticalProblems(id);
    if (!problems) {
      problems = generateMockPracticalProblems(id);
      savePracticalProblems(problems);
    }
    setPracticalProblems(problems);
    // Select first problem if available
    if (problems.problems.length > 0 && !selectedProblemId) {
      setSelectedProblemId(problems.problems[0].id);
    }
  }, [id, course?.type, selectedProblemId]);

  // Load user attempts
  React.useEffect(() => {
    if (!user?.email || !practicalProblems) return;
    const attempts: Record<string, number> = {};
    practicalProblems.problems.forEach((problem) => {
      attempts[problem.id] = getUserAttempts(user.email, problem.id);
    });
    setUserAttempts(attempts);
  }, [user?.email, practicalProblems]);

  const handleAddMaterials = (files: File[], weekNumber: number) => {
    if (!courseMaterials || !id) return;

    const newMaterials: CourseMaterial[] = files.map((file, index) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      let type: CourseMaterial["type"] = "PDF";
      if (["pptx", "ppt"].includes(ext)) type = "Slide";
      else if (["py", "cpp", "java", "js", "ts"].includes(ext)) type = "Code";
      else if (ext === "pdf") type = "PDF";
      else type = "Problem Sheet";

      return {
        id: `mat-${Date.now()}-${index}`,
        name: file.name,
        type,
        fileUrl: `/mock-files/${file.name}`,
        uploadedBy: user?.email || "admin",
        uploadedAt: new Date().toISOString().split("T")[0],
      };
    });

    const updatedMaterials = { ...courseMaterials };
    let week = updatedMaterials.weeks.find((w) => w.weekNumber === weekNumber);
    if (!week) {
      week = { weekNumber, materials: [] };
      updatedMaterials.weeks.push(week);
      updatedMaterials.weeks.sort((a, b) => a.weekNumber - b.weekNumber);
    }
    week.materials.push(...newMaterials);
    setCourseMaterials(updatedMaterials);
    saveCourseMaterials(updatedMaterials);
  };

  const handleAddPracticalProblem = (data: {
    title: string;
    readmeFile: File | null;
    solutionCode: File | null;
    testCasesFile: File | null;
    weekNumber: number;
    maxAttemptsBeforeSolution: number;
  }) => {
    if (!practicalProblems || !id) return;

    const readFileContent = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(file);
      });
    };

    Promise.all([
      data.readmeFile ? readFileContent(data.readmeFile) : Promise.resolve(""),
      data.solutionCode
        ? readFileContent(data.solutionCode)
        : Promise.resolve(""),
      data.testCasesFile
        ? readFileContent(data.testCasesFile).then((content) => {
            try {
              return JSON.parse(content);
            } catch {
              return [];
            }
          })
        : Promise.resolve([]),
    ]).then(([readmeContent, solutionContent, testCases]) => {
      const ext = data.solutionCode?.name.split(".").pop()?.toLowerCase() || "";
      let language = "Python";
      if (ext === "cpp" || ext === "c") language = "C++";
      else if (ext === "java") language = "Java";
      else if (ext === "js" || ext === "ts") language = "JavaScript";

      const newProblem: PracticalProblem = {
        id: `prob-${Date.now()}`,
        weekNumber: data.weekNumber,
        title: data.title,
        readmeFile: data.readmeFile?.name || "",
        readmeContent,
        solutionCode: data.solutionCode?.name || "",
        solutionContent,
        testCasesFile: data.testCasesFile?.name || "",
        testCases: Array.isArray(testCases) ? testCases : [],
        language,
        maxAttemptsBeforeSolution: data.maxAttemptsBeforeSolution,
        difficulty: "Medium", // Default, can be made configurable
      };

      const updatedProblems = {
        ...practicalProblems,
        problems: [...practicalProblems.problems, newProblem],
      };
      setPracticalProblems(updatedProblems);
      savePracticalProblems(updatedProblems);
      setSelectedProblemId(newProblem.id);
    });
  };

  return (
    <ProtectedRoute>
      {!user || !course ? null : (
        <div className="min-h-screen bg-background text-foreground">
          <Navbar
            userName={user.full_name}
            showAuthLinks={false}
            showDashboardLinks
          />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Course Header */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {course.name}
                  </h1>
                  <Badge
                    variant={course.type === "Theory" ? "default" : "secondary"}
                  >
                    {course.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Course ID: {course.id}
                </p>
              </div>
              {isAdmin && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    if (course.type === "Lab" && labTab === "practical") {
                      setShowAddProblemDialog(true);
                    } else {
                      setShowAddMaterialsDialog(true);
                    }
                  }}
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                  {course.type === "Lab" && labTab === "practical"
                    ? "Add Practical Problem"
                    : "Add Study Materials"}
                </Button>
              )}
            </div>

            {/* Search Bar */}
            {courseMaterials && (
              <div className="mb-6">
                <IntelligentSearch
                  allMaterials={getAllMaterials(courseMaterials)}
                />
              </div>
            )}

            {/* Theory Course Content */}
            {course.type === "Theory" && courseMaterials && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Study Materials</h2>
                <WeekAccordion weeks={courseMaterials.weeks} />
              </Card>
            )}

            {/* Lab Course Content with Tabs */}
            {course.type === "Lab" && (
              <div className="space-y-4">
                {/* Tab Navigation */}
                <div className="flex gap-2 border-b border-border">
                  <button
                    onClick={() => setLabTab("study-materials")}
                    className={`
                  px-4 py-2 text-sm font-medium transition-colors border-b-2
                  ${
                    labTab === "study-materials"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }
                `}
                  >
                    Study Materials
                  </button>
                  <button
                    onClick={() => setLabTab("practical")}
                    className={`
                  px-4 py-2 text-sm font-medium transition-colors border-b-2
                  ${
                    labTab === "practical"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }
                `}
                  >
                    Practical
                  </button>
                </div>

                {/* Study Materials Tab */}
                {labTab === "study-materials" && courseMaterials && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Study Materials
                    </h2>
                    <WeekAccordion weeks={courseMaterials.weeks} />
                  </Card>
                )}

                {/* Practical Tab */}
                {labTab === "practical" && practicalProblems && (
                  <Card className="p-6">
                    {isAdmin && (
                      <div className="mb-4 flex justify-end">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setShowAddProblemDialog(true)}
                        >
                          <HugeiconsIcon
                            icon={PlusSignIcon}
                            className="size-4 mr-2"
                          />
                          Add Practical Problem
                        </Button>
                      </div>
                    )}
                    <PracticalProblemView
                      problems={practicalProblems.problems}
                      selectedProblemId={selectedProblemId}
                      onProblemSelect={setSelectedProblemId}
                      userAttempts={userAttempts}
                      userId={user.email}
                      isAdmin={isAdmin}
                    />
                  </Card>
                )}
              </div>
            )}

            {/* Navigation Links */}
            <div className="mt-8 flex gap-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/courses">
                <Button variant="subtle" size="sm">
                  My Courses
                </Button>
              </Link>
            </div>
          </main>

          {/* Dialogs */}
          <AddStudyMaterialsDialog
            open={showAddMaterialsDialog}
            onOpenChange={setShowAddMaterialsDialog}
            onSave={handleAddMaterials}
          />
          <AddPracticalProblemDialog
            open={showAddProblemDialog}
            onOpenChange={setShowAddProblemDialog}
            onSave={handleAddPracticalProblem}
          />
        </div>
      )}
    </ProtectedRoute>
  );
}
