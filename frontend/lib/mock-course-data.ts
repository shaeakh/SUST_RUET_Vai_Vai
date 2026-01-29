/**
 * Mock data structures for course materials and practical problems
 */

export type MaterialType = "Slide" | "PDF" | "Code" | "Problem Sheet";

export interface CourseMaterial {
  id: string;
  name: string;
  type: MaterialType;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface WeekMaterials {
  weekNumber: number;
  materials: CourseMaterial[];
}

export interface CourseMaterialsData {
  courseId: string;
  courseType: "Theory" | "Lab";
  weeks: WeekMaterials[];
}

export interface PracticalProblem {
  id: string;
  weekNumber: number;
  title: string;
  readmeFile: string;
  readmeContent?: string; // Markdown content
  solutionCode: string;
  solutionContent?: string; // Code content
  testCasesFile: string;
  testCases?: TestCase[];
  language: string;
  maxAttemptsBeforeSolution: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

export interface PracticalProblemsData {
  courseId: string;
  problems: PracticalProblem[];
}

// Mock data generators
export function generateMockCourseMaterials(
  courseId: string,
  courseType: "Theory" | "Lab",
): CourseMaterialsData {
  return {
    courseId,
    courseType,
    weeks: [
      {
        weekNumber: 1,
        materials: [
          {
            id: "mat-001",
            name: "Introduction to Machine Learning.pdf",
            type: "PDF",
            fileUrl: "/mock-files/ml-intro.pdf",
            uploadedBy: "admin",
            uploadedAt: "2024-01-15",
          },
          {
            id: "mat-002",
            name: "Week 1 Lecture Slides.pptx",
            type: "Slide",
            fileUrl: "/mock-files/week1-slides.pptx",
            uploadedBy: "admin",
            uploadedAt: "2024-01-15",
          },
        ],
      },
      {
        weekNumber: 2,
        materials: [
          {
            id: "mat-003",
            name: "Linear Regression Code.py",
            type: "Code",
            fileUrl: "/mock-files/linear-regression.py",
            uploadedBy: "admin",
            uploadedAt: "2024-01-22",
          },
          {
            id: "mat-004",
            name: "Week 2 Problem Sheet.pdf",
            type: "Problem Sheet",
            fileUrl: "/mock-files/week2-problems.pdf",
            uploadedBy: "admin",
            uploadedAt: "2024-01-22",
          },
        ],
      },
      {
        weekNumber: 3,
        materials: [
          {
            id: "mat-005",
            name: "Neural Networks Basics.pptx",
            type: "Slide",
            fileUrl: "/mock-files/nn-basics.pptx",
            uploadedBy: "admin",
            uploadedAt: "2024-01-29",
          },
        ],
      },
    ],
  };
}

export function generateMockPracticalProblems(
  courseId: string,
): PracticalProblemsData {
  return {
    courseId,
    problems: [
      {
        id: "prob-001",
        weekNumber: 1,
        title: "Two Sum Problem",
        readmeFile: "/mock-files/two-sum-readme.md",
        readmeContent: `# Two Sum Problem

## Problem Description
Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

## Input Format
- First line contains an integer \`n\` (2 ≤ n ≤ 10^4)
- Second line contains \`n\` space-separated integers
- Third line contains the target integer

## Output Format
Print two space-separated indices (0-indexed)

## Example
\`\`\`
Input:
4
2 7 11 15
9

Output:
0 1
\`\`\`

## Constraints
- 2 ≤ nums.length ≤ 10^4
- -10^9 ≤ nums[i] ≤ 10^9
- -10^9 ≤ target ≤ 10^9`,
        solutionCode: "/mock-files/two-sum-solution.py",
        solutionContent: `def two_sum(nums, target):
    hash_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hash_map:
            return [hash_map[complement], i]
        hash_map[num] = i
    return []`,
        testCasesFile: "/mock-files/two-sum-tests.json",
        testCases: [
          {
            input: "4\n2 7 11 15\n9",
            expectedOutput: "0 1",
            description: "Basic example",
          },
          {
            input: "3\n3 2 4\n6",
            expectedOutput: "1 2",
            description: "Different indices",
          },
        ],
        language: "Python",
        maxAttemptsBeforeSolution: 3,
        difficulty: "Easy",
      },
      {
        id: "prob-002",
        weekNumber: 2,
        title: "Binary Search Implementation",
        readmeFile: "/mock-files/binary-search-readme.md",
        readmeContent: `# Binary Search Implementation

## Problem Description
Implement binary search to find a target value in a sorted array. Return the index of the target if found, otherwise return -1.

## Input Format
- First line contains an integer \`n\` (1 ≤ n ≤ 10^4)
- Second line contains \`n\` space-separated sorted integers
- Third line contains the target integer

## Output Format
Print the index of the target (0-indexed) or -1 if not found

## Example
\`\`\`
Input:
5
1 3 5 7 9
5

Output:
2
\`\`\`

## Constraints
- Array is sorted in ascending order
- All elements are unique`,
        solutionCode: "/mock-files/binary-search-solution.cpp",
        solutionContent: `int binarySearch(vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
        testCasesFile: "/mock-files/binary-search-tests.json",
        testCases: [
          {
            input: "5\n1 3 5 7 9\n5",
            expectedOutput: "2",
            description: "Target found",
          },
          {
            input: "5\n1 3 5 7 9\n4",
            expectedOutput: "-1",
            description: "Target not found",
          },
        ],
        language: "C++",
        maxAttemptsBeforeSolution: 5,
        difficulty: "Medium",
      },
    ],
  };
}

// Local storage helpers
const COURSE_MATERIALS_KEY = "vai-vai-course-materials";
const PRACTICAL_PROBLEMS_KEY = "vai-vai-practical-problems";
const USER_ATTEMPTS_KEY = "vai-vai-user-attempts";

export function getCourseMaterials(
  courseId: string,
): CourseMaterialsData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COURSE_MATERIALS_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw) as Record<string, CourseMaterialsData>;
    return all[courseId] || null;
  } catch {
    return null;
  }
}

export function saveCourseMaterials(data: CourseMaterialsData): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(COURSE_MATERIALS_KEY);
    const all = raw
      ? (JSON.parse(raw) as Record<string, CourseMaterialsData>)
      : {};
    all[data.courseId] = data;
    window.localStorage.setItem(COURSE_MATERIALS_KEY, JSON.stringify(all));
  } catch {
    // Ignore errors
  }
}

export function getPracticalProblems(
  courseId: string,
): PracticalProblemsData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PRACTICAL_PROBLEMS_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw) as Record<string, PracticalProblemsData>;
    return all[courseId] || null;
  } catch {
    return null;
  }
}

export function savePracticalProblems(data: PracticalProblemsData): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(PRACTICAL_PROBLEMS_KEY);
    const all = raw
      ? (JSON.parse(raw) as Record<string, PracticalProblemsData>)
      : {};
    all[data.courseId] = data;
    window.localStorage.setItem(PRACTICAL_PROBLEMS_KEY, JSON.stringify(all));
  } catch {
    // Ignore errors
  }
}

export function getUserAttempts(userId: string, problemId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(USER_ATTEMPTS_KEY);
    if (!raw) return 0;
    const all = JSON.parse(raw) as Record<string, Record<string, number>>;
    return all[userId]?.[problemId] || 0;
  } catch {
    return 0;
  }
}

export function incrementUserAttempts(
  userId: string,
  problemId: string,
): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(USER_ATTEMPTS_KEY);
    const all = raw
      ? (JSON.parse(raw) as Record<string, Record<string, number>>)
      : {};
    if (!all[userId]) all[userId] = {};
    all[userId][problemId] = (all[userId][problemId] || 0) + 1;
    window.localStorage.setItem(USER_ATTEMPTS_KEY, JSON.stringify(all));
    return all[userId][problemId];
  } catch {
    return 0;
  }
}
