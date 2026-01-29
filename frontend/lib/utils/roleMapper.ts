export type FrontendRole = "user" | "admin";
export type BackendRole = "student" | "instructor";

// Frontend -> Backend
export function toBackendRole(role: FrontendRole): BackendRole {
  return role === "admin" ? "instructor" : "student";
}

// Backend -> Frontend
export function toFrontendRole(role: BackendRole | string): FrontendRole {
  return role === "instructor" ? "admin" : "user";
}
