"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ActionButtonsProps {
  onRun: () => void
  onSubmit: () => void
  isRunning?: boolean
  isSubmitting?: boolean
  disabled?: boolean
}

export function ActionButtons({
  onRun,
  onSubmit,
  isRunning = false,
  isSubmitting = false,
  disabled = false,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={onRun}
        disabled={disabled || isRunning || isSubmitting}
        variant="outline"
        size="sm"
      >
        {isRunning ? (
          <>
            <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Running...
          </>
        ) : (
          "Run"
        )}
      </Button>
      <Button
        onClick={onSubmit}
        disabled={disabled || isRunning || isSubmitting}
        size="sm"
      >
        {isSubmitting ? (
          <>
            <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Submitting...
          </>
        ) : (
          "Submit"
        )}
      </Button>
    </div>
  )
}
