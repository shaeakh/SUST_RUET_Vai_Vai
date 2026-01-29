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
import type { MaterialType } from "@/lib/mock-course-data";
import { cn } from "@/lib/utils";
import { Cancel01Icon, FileIcon, UploadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";

interface AddStudyMaterialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (files: File[], weekNumber: number) => void;
  maxWeeks?: number;
}

const ACCEPTED_FILE_TYPES = [
  ".pptx",
  ".ppt",
  ".pdf",
  ".py",
  ".cpp",
  ".java",
  ".js",
  ".ts",
  ".zip",
  ".doc",
  ".docx",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function detectMaterialType(fileName: string): MaterialType {
  const ext = fileName.toLowerCase().split(".").pop();
  if (ext === "pptx" || ext === "ppt") return "Slide";
  if (ext === "pdf") return "PDF";
  if (["py", "cpp", "java", "js", "ts"].includes(ext || "")) return "Code";
  return "Problem Sheet";
}

export function AddStudyMaterialsDialog({
  open,
  onOpenChange,
  onSave,
  maxWeeks = 12,
}: AddStudyMaterialsDialogProps) {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [selectedWeek, setSelectedWeek] = React.useState<string>("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const newErrors: Record<string, string> = {};

    files.forEach((file) => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED_FILE_TYPES.includes(ext)) {
        newErrors[file.name] = `File type ${ext} not supported`;
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        newErrors[file.name] = `File size exceeds 10MB limit`;
        return;
      }
      validFiles.push(file);
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setErrors(newErrors);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    const fileName = selectedFiles[index]?.name;
    if (fileName && errors[fileName]) {
      const newErrors = { ...errors };
      delete newErrors[fileName];
      setErrors(newErrors);
    }
  };

  const handleSave = () => {
    if (selectedFiles.length === 0) {
      setErrors({ general: "Please select at least one file" });
      return;
    }
    if (!selectedWeek) {
      setErrors({ general: "Please select a week" });
      return;
    }
    onSave(selectedFiles, parseInt(selectedWeek));
    handleClose();
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setSelectedWeek("");
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Add Study Materials</AlertDialogTitle>
          <AlertDialogDescription>
            Upload files and assign them to a specific week. Multiple files can
            be uploaded at once.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Files</label>
            <div className="flex flex-col gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_FILE_TYPES.join(",")}
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Accepted formats: {ACCEPTED_FILE_TYPES.join(", ")} (Max 10MB per
                file)
              </p>
            </div>

            {/* File Preview List */}
            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium">
                  Selected Files ({selectedFiles.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-border bg-muted/30 p-2">
                  {selectedFiles.map((file, index) => {
                    const materialType = detectMaterialType(file.name);
                    const fileError = errors[file.name];
                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center justify-between rounded-md border border-border bg-card p-2",
                          fileError && "border-destructive",
                        )}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <HugeiconsIcon
                            icon={FileIcon}
                            className="size-4 text-muted-foreground flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{file.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{(file.size / 1024).toFixed(1)} KB</span>
                              <span>•</span>
                              <span>Type: {materialType}</span>
                            </div>
                            {fileError && (
                              <p className="text-xs text-destructive mt-1">
                                {fileError}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="ml-2 rounded-md p-1 text-muted-foreground hover:text-destructive transition-colors"
                          type="button"
                        >
                          <HugeiconsIcon
                            icon={Cancel01Icon}
                            className="size-4"
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
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
          </div>

          {errors.general && (
            <p className="text-sm text-destructive">{errors.general}</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
          <Button onClick={handleSave} variant="default">
            <HugeiconsIcon icon={UploadIcon} className="size-4 mr-2" />
            Upload Materials
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
