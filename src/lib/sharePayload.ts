import { deflate, inflate } from "pako";
import type { Assignment, Course, Exam } from "@/types";

export type SharedCoursePayload = {
  course: Pick<Course, "code" | "name" | "color">;
  assignments: Pick<Assignment, "title" | "dueDate" | "weightPct">[];
  exams: Pick<Exam, "title" | "date">[];
};

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export function encodeSharePayload(payload: SharedCoursePayload): string {
  const compressed = deflate(JSON.stringify(payload));
  return base64UrlEncode(compressed);
}

export function decodeSharePayload(data: string): SharedCoursePayload | null {
  try {
    const bytes = base64UrlDecode(data);
    const json = inflate(bytes, { toText: true });
    return JSON.parse(json) as SharedCoursePayload;
  } catch {
    return null;
  }
}
