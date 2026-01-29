"use client"

import * as React from "react"
import Editor from "@monaco-editor/react"
import type { OnMount } from "@monaco-editor/react"

interface CodeEditorProps {
  language: string
  value: string
  onChange: (value: string | undefined) => void
  height?: string
  className?: string
  readOnly?: boolean
}

export function CodeEditor({
  language,
  value,
  onChange,
  height = "100%",
  className,
  readOnly = false,
}: CodeEditorProps) {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleEditorDidMount: OnMount = React.useCallback(
    (editor, monaco) => {
      // Configure editor options
      editor.updateOptions({
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        roundedSelection: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
        readOnly: readOnly,
      })
    },
    [readOnly],
  )

  if (!isMounted) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border bg-muted ${className}`}
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">Loading editor...</p>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-lg border ${className}`} style={{ height }}>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          padding: { top: 12, bottom: 12 },
          readOnly: readOnly,
        }}
      />
    </div>
  )
}
