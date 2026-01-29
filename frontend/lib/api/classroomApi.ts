import { api } from "@/lib/api/axiosConfig";

type ApiEnvelope<T> = {
  success: boolean;
  status_code: number;
  data: T;
};

export type ClassroomType = "lab" | "thoery" | "theory";

export type Classroom = {
  id: string;
  instructor_id: string;
  name: string;
  description: string;
  join_code: string;
  created_at: string;
  /**
   * Optional: backend may or may not return it, but UI can use it.
   * Expected request values: "thoery" | "lab"
   */
  type?: ClassroomType;
};

export type CreateClassroomInput = {
  name: string;
  type: ClassroomType;
  description: string;
};

function coerceClassroomArray(data: unknown): Classroom[] {
  // Be tolerant to slight backend variations.
  if (Array.isArray(data)) return data as Classroom[];
  if (data && typeof data === "object") {
    const maybe = data as { classrooms?: Classroom[] };
    if (Array.isArray(maybe.classrooms)) return maybe.classrooms;
  }
  return [];
}

export async function listClassrooms(): Promise<ApiEnvelope<Classroom[]>> {
  const res = await api.get<ApiEnvelope<unknown>>("/classrooms");
  return { ...res.data, data: coerceClassroomArray(res.data.data) };
}

// Student: get classrooms the student is enrolled in
export async function listMyClassrooms(): Promise<ApiEnvelope<Classroom[]>> {
  const res = await api.get<ApiEnvelope<unknown>>("/classrooms/my-classrooms");
  return { ...res.data, data: coerceClassroomArray(res.data.data) };
}

export async function getClassroomById(
  id: string,
): Promise<ApiEnvelope<Classroom>> {
  const res = await api.get<ApiEnvelope<Classroom>>(`/classrooms/${id}`);
  return res.data;
}

export async function createClassroom(
  input: CreateClassroomInput,
): Promise<ApiEnvelope<Classroom>> {
  const res = await api.post<ApiEnvelope<Classroom>>("/classrooms", {
    name: input.name,
    type: input.type,
    description: input.description,
  });
  return res.data;
}
