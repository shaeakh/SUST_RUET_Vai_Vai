"use client";

import { Button } from "@/components/Button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FileIcon, UploadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";

interface AddPracticalProblemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    title: string;
    readmeFile: File | null;
    solutionCode: File | null;
    testCasesFile: File | null;
    weekNumber: number;
    maxAttemptsBeforeSolution: number;
  }) => void;
  maxWeeks?: number;
}

export function AddPracticalProblemDialog({
  open,
  onOpenChange,
  onSave,
  maxWeeks = 12,
}: AddPracticalProblemDialogProps) {
  const [title, setTitle] = React.useState("");
  const [readmeFile, setReadmeFile] = React.useState<File | null>(null);
  const [solutionFile, setSolutionFile] = React.useState<File | null>(null);
  const [testCasesFile, setTestCasesFile] = React.useState<File | null>(null);
  const [selectedWeek, setSelectedWeek] = React.useState<string>("");
  const [maxAttempts, setMaxAttempts] = React.useState<string>("3");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const readmeInputRef = React.useRef<HTMLInputElement>(null);
  const solutionInputRef = React.useRef<HTMLInputElement>(null);
  const testCasesInputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Problem title is required";
    }
    if (!readmeFile) {
      newErrors.readme = "README file is required";
    }
    if (!solutionFile) {
      newErrors.solution = "Solution code file is required";
    }
    if (!testCasesFile) {
      newErrors.testCases = "Test cases file is required";
    }
    if (!selectedWeek) {
      newErrors.week = "Week selection is required";
    }
    const attempts = parseInt(maxAttempts);
    if (isNaN(attempts) || attempts < 1 || attempts > 10) {
      newErrors.attempts = "Attempts must be between 1 and 10";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      title: title.trim(),
      readmeFile,
      solutionCode: solutionFile,
      testCasesFile,
      weekNumber: parseInt(selectedWeek),
      maxAttemptsBeforeSolution: attempts,
    });

    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setReadmeFile(null);
    setSolutionFile(null);
    setTestCasesFile(null);
    setSelectedWeek("");
    setMaxAttempts("3");
    setErrors({});
    if (readmeInputRef.current) readmeInputRef.current.value = "";
    if (solutionInputRef.current) solutionInputRef.current.value = "";
    if (testCasesInputRef.current) testCasesInputRef.current.value = "";
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Add Practical Problem</AlertDialogTitle>
          <AlertDialogDescription>
            Create a new coding problem with problem statement, solution code,
            and test cases.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Problem Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Problem Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Two Sum Problem"
              className={cn(errors.title && "border-destructive")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* README File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Problem Statement (README.md)
            </label>
            <div className="flex flex-col gap-2">
              <Input
                ref={readmeInputRef}
                type="file"
                accept=".md"
                onChange={(e) => setReadmeFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {readmeFile && (
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-2">
                  <HugeiconsIcon
                    icon={FileIcon}
                    className="size-4 text-muted-foreground"
                  />
                  <span className="text-sm flex-1">{readmeFile.name}</span>
                </div>
              )}
            </div>
            {errors.readme && (
              <p className="text-xs text-destructive">{errors.readme}</p>
            )}
          </div>

          {/* Solution Code Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Solution Code</label>
            <div className="flex flex-col gap-2">
              <Input
                ref={solutionInputRef}
                type="file"
                accept=".py,.cpp,.java,.js,.ts"
                onChange={(e) => setSolutionFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {solutionFile && (
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-2">
                  <HugeiconsIcon
                    icon={FileIcon}
                    className="size-4 text-muted-foreground"
                  />
                  <span className="text-sm flex-1">{solutionFile.name}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Accepted: .py, .cpp, .java, .js, .ts
            </p>
            {errors.solution && (
              <p className="text-xs text-destructive">{errors.solution}</p>
            )}
          </div>

          {/* Test Cases File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Cases File</label>
            <div className="flex flex-col gap-2">
              <Input
                ref={testCasesInputRef}
                type="file"
                accept=".json,.txt"
                onChange={(e) => setTestCasesFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {testCasesFile && (
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-2">
                  <HugeiconsIcon
                    icon={FileIcon}
                    className="size-4 text-muted-foreground"
                  />
                  <span className="text-sm flex-1">{testCasesFile.name}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Accepted: .json, .txt
            </p>
            {errors.testCases && (
              <p className="text-xs text-destructive">{errors.testCases}</p>
            )}
          </div>

          {/* Week Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Assign to Week</label>
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a week" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxWeeks }, (_, i) => i + 1).map(
                  (week) => (
                    <SelectItem key={week} value={week.toString()}>
                      Week {week}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            {errors.week && (
              <p className="text-xs text-destructive">{errors.week}</p>
            )}
          </div>

          {/* Max Attempts */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Wrong Attempts Before Showing Solution
            </label>
            <Input
              type="number"
              min="1"
              max="10"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              className={cn(errors.attempts && "border-destructive")}
            />
            <p className="text-xs text-muted-foreground">
              Students can view the solution after X wrong attempts (1-10)
            </p>
            {errors.attempts && (
              <p className="text-xs text-destructive">{errors.attempts}</p>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
          <Button onClick={handleSave} variant="default">
            <HugeiconsIcon icon={UploadIcon} className="size-4 mr-2" />
            Save Problem
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
