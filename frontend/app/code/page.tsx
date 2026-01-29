import { Suspense } from "react";
import { ErrorBoundary } from "@/components/code-editor/error-boundary";
import { CodeWorkspace } from "@/components/code-editor/code-workspace";

function CodeWorkspaceFallback() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function CodePage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<CodeWorkspaceFallback />}>
        <CodeWorkspace />
      </Suspense>
    </ErrorBoundary>
  );
}
