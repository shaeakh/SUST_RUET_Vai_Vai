"use client";

import { Button } from "@/components/Button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { CourseMaterial } from "@/lib/mock-course-data";
import { cn } from "@/lib/utils";
import {
  Cancel01Icon,
  DownloadIcon,
  File01Icon,
  FileIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface FilePreviewDialogProps {
  material: CourseMaterial;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getMaterialTypeColor = (type: CourseMaterial["type"]) => {
  switch (type) {
    case "Slide":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    case "PDF":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    case "Code":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    case "Problem Sheet":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
  }
};

export function FilePreviewDialog({
  material,
  open,
  onOpenChange,
}: FilePreviewDialogProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = material.fileUrl;
    link.download = material.name;
    link.click();
  };

  const handleOpenInNewTab = () => {
    window.open(material.fileUrl, "_blank");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
    });
  };

  const renderPreview = () => {
    switch (material.type) {
      case "PDF":
        return (
          <div className="w-full h-[600px] border border-border rounded-lg overflow-hidden">
            <iframe
              src={material.fileUrl}
              width="100%"
              height="100%"
              title="PDF Preview"
              className="w-full h-full"
            />
          </div>
        );

      case "Slide":
        return (
          <div className="flex flex-col items-center justify-center py-16 px-8 bg-muted/30 rounded-lg border border-border">
            <HugeiconsIcon
              icon={File01Icon}
              className="size-16 text-muted-foreground mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">
              PowerPoint Preview Unavailable
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
              Browser cannot display PowerPoint files directly. Please download
              the file to view it.
            </p>
            <Button onClick={handleDownload} variant="default">
              <HugeiconsIcon icon={DownloadIcon} className="size-4 mr-2" />
              Download {material.name}
            </Button>
          </div>
        );

      case "Code":
        return (
          <div className="w-full border border-border rounded-lg overflow-hidden bg-[#1e1e1e]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#3e3e3e]">
              <Badge className="bg-[#3e3e3e] text-white border-none">
                {material.language || "Code"}
              </Badge>
              <button
                onClick={() => copyToClipboard(material.content || "")}
                className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded transition-colors"
              >
                Copy Code
              </button>
            </div>
            <pre className="p-4 overflow-auto max-h-[500px] text-sm text-gray-300 font-mono">
              <code>{material.content || "No content available"}</code>
            </pre>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-16 px-8 bg-muted/30 rounded-lg border border-border">
            <HugeiconsIcon
              icon={FileIcon}
              className="size-16 text-muted-foreground mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">
              Preview Not Available
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Preview is not available for this file type.
            </p>
            <Button onClick={handleDownload} variant="default">
              <HugeiconsIcon icon={DownloadIcon} className="size-4 mr-2" />
              Download {material.name}
            </Button>
          </div>
        );
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex items-start justify-between">
            <AlertDialogTitle className="pr-8">
              {material.name}
            </AlertDialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors -mt-1 -mr-1"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
            </button>
          </div>

          {/* Material Info */}
          <div className="flex items-center gap-3 flex-wrap mt-2">
            <Badge
              className={cn(
                "text-xs px-2 py-0.5",
                getMaterialTypeColor(material.type),
              )}
            >
              {material.type}
            </Badge>
            {material.weekNumber && (
              <>
                <span className="text-xs text-muted-foreground">|</span>
                <span className="text-xs text-muted-foreground">
                  Week {material.weekNumber}
                </span>
              </>
            )}
            {material.size && (
              <>
                <span className="text-xs text-muted-foreground">|</span>
                <span className="text-xs text-muted-foreground">
                  {material.size}
                </span>
              </>
            )}
          </div>

          {/* Tags */}
          {material.tags && material.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {material.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </AlertDialogHeader>

        {/* Preview Area */}
        <div className="mt-4">{renderPreview()}</div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
          <Button onClick={handleDownload} variant="default">
            <HugeiconsIcon icon={DownloadIcon} className="size-4 mr-2" />
            Download
          </Button>
          <Button onClick={handleOpenInNewTab} variant="outline">
            <HugeiconsIcon icon={DownloadIcon} className="size-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
