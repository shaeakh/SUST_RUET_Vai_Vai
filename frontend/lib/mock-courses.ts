/**
 * Mock course data and localStorage persistence for the CMS dashboard.
 * Replace with API calls when backend is integrated.
 */

export type CourseType = "Lab" | "Theory";

export interface Course {
  id: string;
  name: string;
  type: CourseType;
  tags: string[];
  logo?: string;
}

const STORAGE_KEY = "vai-vai-courses";

export const MOCK_COURSES: Course[] = [
  {
    id: "course-001",
    name: "Introduction to Machine Learning",
    type: "Theory",
    tags: ["AI", "ML", "Python", "Week 1-5"],
    logo: "/placeholder-icon.svg",
  },
  {
    id: "course-002",
    name: "Advanced Data Structures Lab",
    type: "Lab",
    tags: ["DSA", "C++", "Algorithms"],
    logo: "/placeholder-icon.svg",
  },
  {
    id: "course-003",
    name: "Neural Networks and Deep Learning",
    type: "Theory",
    tags: ["AI", "Deep Learning", "TensorFlow"],
    logo: "/placeholder-icon.svg",
  },
  {
    id: "course-004",
    name: "Operating Systems Lab",
    type: "Lab",
    tags: ["OS", "C", "Systems"],
    logo: "/placeholder-icon.svg",
  },
];

function getStoredCourses(): Course[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Course[];
  } catch {
    return null;
  }
}

function setStoredCourses(courses: Course[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

/** Initial courses: stored override or default mock list. */
export function getInitialCourses(): Course[] {
  const stored = getStoredCourses();
  if (stored && Array.isArray(stored) && stored.length > 0) return stored;
  return [...MOCK_COURSES];
}

/** Persist courses (e.g. after creating a new one). */
export function persistCourses(courses: Course[]): void {
  setStoredCourses(courses);
}

/** Generate a mock ID for new courses. */
export function generateCourseId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `course-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `course-${Date.now()}`;
}
