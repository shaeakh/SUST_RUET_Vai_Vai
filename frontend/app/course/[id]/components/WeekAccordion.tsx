"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CourseMaterial, MaterialType } from "@/lib/mock-course-data";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  CodeIcon,
  DownloadIcon,
  EyeIcon,
  File01Icon,
  FileIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";

interface WeekAccordionProps {
  weeks: Array<{
    weekNumber: number;
    materials: CourseMaterial[];
  }>;
  onMaterialClick?: (material: CourseMaterial) => void;
}

const getMaterialIcon = (type: MaterialType) => {
  switch (type) {
    case "Slide":
      return File01Icon;
    case "PDF":
      return FileIcon;
    case "Code":
      return CodeIcon;
    case "Problem Sheet":
      return FileIcon;
    default:
      return FileIcon;
  }
};

const getMaterialTypeColor = (type: MaterialType) => {
  switch (type) {
    case "Slide":
      return "text-blue-500";
    case "PDF":
      return "text-red-500";
    case "Code":
      return "text-green-500";
    case "Problem Sheet":
      return "text-purple-500";
    default:
      return "text-muted-foreground";
  }
};

export function WeekAccordion({ weeks, onMaterialClick }: WeekAccordionProps) {
  const [expandedWeek, setExpandedWeek] = React.useState<number | null>(null);

  const handleWeekClick = (weekNumber: number) => {
    setExpandedWeek(expandedWeek === weekNumber ? null : weekNumber);
  };

  return (
    <div className="space-y-2">
      {weeks.map((week) => {
        const isExpanded = expandedWeek === week.weekNumber;
        return (
          <Card key={week.weekNumber} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
              onClick={() => handleWeekClick(week.weekNumber)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  Week {week.weekNumber}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {week.materials.length} material
                    {week.materials.length !== 1 ? "s" : ""}
                  </span>
                  <HugeiconsIcon
                    icon={ChevronDown}
                    className={cn(
                      "size-5 text-muted-foreground transition-transform duration-200",
                      isExpanded && "rotate-180",
                    )}
                  />
                </div>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent className="pt-0">
                {week.materials.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No materials available for this week
                  </p>
                ) : (
                  <div className="space-y-2">
                    {week.materials.map((material) => {
                      const Icon = getMaterialIcon(material.type);
                      return (
                        <div
                          key={material.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <HugeiconsIcon
                              icon={Icon}
                              className={cn(
                                "size-5 flex-shrink-0",
                                getMaterialTypeColor(material.type),
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {material.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {material.type} • Uploaded {material.uploadedAt}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMaterialClick?.(material);
                              }}
                              className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              title="View"
                            >
                              <HugeiconsIcon
                                icon={EyeIcon}
                                className="size-4"
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Mock download
                                console.log("Download:", material.fileUrl);
                              }}
                              className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              title="Download"
                            >
                              <HugeiconsIcon
                                icon={DownloadIcon}
                                className="size-4"
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
