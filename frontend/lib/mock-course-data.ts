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
  weekNumber?: number;
  tags?: string[];
  description?: string;
  content?: string; // Extracted/mock content for semantic search
  language?: string; // For code files: "cpp", "python", "java", etc.
  syntaxTokens?: string[]; // For syntax-aware search in code files
  size?: string; // File size display: "2.5 MB", "3 KB", etc.
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
            name: "Introduction to C++ Programming.pdf",
            type: "PDF",
            fileUrl: "/sample_files/ClassWork1.pdf",
            uploadedBy: "admin",
            uploadedAt: "2024-01-15",
            weekNumber: 1,
            tags: ["C++", "Programming", "Basics", "Introduction", "Syntax"],
            description:
              "Introduction to C++ programming covering basics, syntax, variables, data types, and control structures",
            content:
              "This document covers the fundamentals of C++ programming language including variables, data types, operators, control flow statements, functions, and basic input/output operations. Topics include: int, float, char, arrays, loops, conditionals, and function declarations.",
            size: "2.5 MB",
          },
          {
            id: "mat-002",
            name: "Object Oriented Programming in C++.pptx",
            type: "Slide",
            fileUrl: "/sample_files/ClassWork2.pptx",
            uploadedBy: "admin",
            uploadedAt: "2024-01-20",
            weekNumber: 2,
            tags: [
              "C++",
              "OOP",
              "Classes",
              "Objects",
              "Inheritance",
              "Polymorphism",
            ],
            description:
              "Object-oriented programming concepts in C++ including classes, inheritance, polymorphism, and encapsulation",
            content:
              "Comprehensive coverage of OOP principles in C++. Topics: class definition, constructors, destructors, access specifiers, inheritance types, virtual functions, abstract classes, operator overloading, and friend functions.",
            size: "1.8 MB",
          },
          {
            id: "mat-003",
            name: "Binary Search Implementation.cpp",
            type: "Code",
            fileUrl: "/mock-files/binary-search.cpp",
            uploadedBy: "admin",
            uploadedAt: "2024-01-22",
            weekNumber: 3,
            tags: [
              "C++",
              "Algorithms",
              "Binary Search",
              "Searching",
              "Divide and Conquer",
            ],
            description:
              "Binary search algorithm implementation in C++ with iterative and recursive approaches",
            content: `// Binary Search in C++
#include <iostream>
#include <vector>
using namespace std;

int binarySearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
            language: "cpp",
            syntaxTokens: [
              "include",
              "iostream",
              "vector",
              "binarySearch",
              "int",
              "while",
              "return",
            ],
            size: "3 KB",
          },
          {
            id: "mat-004",
            name: "Python Data Structures.pdf",
            type: "PDF",
            fileUrl: "/mock-files/python-ds.pdf",
            uploadedBy: "admin",
            uploadedAt: "2024-01-25",
            weekNumber: 1,
            tags: [
              "Python",
              "Data Structures",
              "Lists",
              "Dictionaries",
              "Tuples",
              "Sets",
            ],
            description:
              "Comprehensive guide to Python data structures including lists, tuples, dictionaries, and sets",
            content:
              "Python provides several built-in data structures. Lists are mutable sequences, tuples are immutable, dictionaries store key-value pairs, and sets contain unique elements. This guide covers operations, methods, and best practices for each data structure.",
            size: "1.2 MB",
          },
        ],
      },
      {
        weekNumber: 2,
        materials: [
          {
            id: "mat-005",
            name: "Sorting Algorithms in C++.cpp",
            type: "Code",
            fileUrl: "/mock-files/sorting.cpp",
            uploadedBy: "admin",
            uploadedAt: "2024-01-28",
            weekNumber: 4,
            tags: [
              "C++",
              "Algorithms",
              "Sorting",
              "Bubble Sort",
              "Quick Sort",
              "Merge Sort",
            ],
            description:
              "Implementation of various sorting algorithms in C++ including bubble sort, quick sort, and merge sort",
            content: `// Sorting Algorithms in C++
#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                swap(arr[j], arr[j+1]);
            }
        }
    }
}

void quickSort(vector<int>& arr, int low, int high) {
    // Quick sort implementation
}`,
            language: "cpp",
            syntaxTokens: [
              "include",
              "vector",
              "bubbleSort",
              "quickSort",
              "swap",
              "for",
              "void",
            ],
            size: "5 KB",
          },
          {
            id: "mat-006",
            name: "C++ STL Containers Guide.pdf",
            type: "PDF",
            fileUrl: "/sample_files/ClassWork1.pdf",
            uploadedBy: "admin",
            uploadedAt: "2024-02-01",
            weekNumber: 5,
            tags: [
              "C++",
              "STL",
              "Containers",
              "Vector",
              "Map",
              "Set",
              "Advanced",
            ],
            description:
              "Complete guide to C++ Standard Template Library containers including vector, map, set, and their operations",
            content:
              "The C++ STL provides powerful container classes: vector for dynamic arrays, map for key-value storage, set for unique elements, list for doubly-linked lists, and more. Each container has specific use cases, time complexities, and member functions.",
            size: "2.1 MB",
          },
        ],
      },
      {
        weekNumber: 3,
        materials: [
          {
            id: "mat-007",
            name: "Java Basics.pdf",
            type: "PDF",
            fileUrl: "/mock-files/java-basics.pdf",
            uploadedBy: "admin",
            uploadedAt: "2024-02-05",
            weekNumber: 1,
            tags: ["Java", "Programming", "Basics", "OOP", "Introduction"],
            description:
              "Introduction to Java programming language covering syntax, OOP concepts, and basic applications",
            content:
              "Java is an object-oriented programming language. This guide covers Java syntax, data types, classes, objects, inheritance, interfaces, exception handling, and collections framework.",
            size: "1.9 MB",
          },
          {
            id: "mat-008",
            name: "Graph Algorithms C++.cpp",
            type: "Code",
            fileUrl: "/mock-files/graph-algorithms.cpp",
            uploadedBy: "admin",
            uploadedAt: "2024-02-10",
            weekNumber: 6,
            tags: ["C++", "Algorithms", "Graph", "BFS", "DFS", "Dijkstra"],
            description:
              "Graph algorithms implementation in C++ including BFS, DFS, and Dijkstra's shortest path",
            content: `// Graph Algorithms in C++
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

class Graph {
    int V;
    vector<vector<int>> adj;
public:
    Graph(int V) : V(V), adj(V) {}
    void addEdge(int u, int v) {
        adj[u].push_back(v);
    }
    void BFS(int start);
    void DFS(int start);
};`,
            language: "cpp",
            syntaxTokens: [
              "include",
              "vector",
              "queue",
              "Graph",
              "BFS",
              "DFS",
              "class",
            ],
            size: "4 KB",
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

// Helper function to get all materials from course materials data
export function getAllMaterials(
  courseMaterials: CourseMaterialsData,
): CourseMaterial[] {
  const allMaterials: CourseMaterial[] = [];
  courseMaterials.weeks.forEach((week) => {
    week.materials.forEach((material) => {
      allMaterials.push({
        ...material,
        weekNumber: week.weekNumber,
      });
    });
  });
  return allMaterials;
}
