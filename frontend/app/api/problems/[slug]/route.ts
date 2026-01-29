import { NextRequest, NextResponse } from "next/server"
import { getProblemBySlug } from "@/lib/mock-data"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    const problem = getProblemBySlug(slug)

    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 },
      )
    }

    return NextResponse.json(problem)
  } catch (error) {
    console.error("Error fetching problem:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
