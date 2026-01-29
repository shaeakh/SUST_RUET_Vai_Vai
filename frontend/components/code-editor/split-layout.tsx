"use client"

import * as React from "react"
import { Panel, Group, Separator } from "react-resizable-panels"

import { cn } from "@/lib/utils"

interface SplitLayoutProps {
  left: React.ReactNode
  right: React.ReactNode
  className?: string
}

export function SplitLayout({ left, right, className }: SplitLayoutProps) {
  return (
    <div className={cn("flex h-full min-h-[calc(100vh-4rem)]", className)}>
      <Group
        orientation="horizontal"
        className="flex w-full gap-2"
      >
        <Panel
          defaultSize={40}
          minSize={25}
          className="rounded-xl border bg-card"
        >
          <div className="flex h-full flex-col overflow-auto p-4">
            {left}
          </div>
        </Panel>
        <Separator className="flex w-1 items-center justify-center">
          <div className="h-24 w-[2px] rounded-full bg-border" />
        </Separator>
        <Panel
          defaultSize={60}
          minSize={35}
          className="rounded-xl border bg-card"
        >
          <div className="flex h-full flex-col overflow-hidden p-4">
            {right}
          </div>
        </Panel>
      </Group>
    </div>
  )
}

