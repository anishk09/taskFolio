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

// Bounds on both the compressed input and decompressed output — a crafted
// join link could otherwise use a small highly-compressed payload to inflate
// into a huge string and hang the visitor's tab (a decompression-bomb DoS
// against whoever opens the link, since this runs entirely client-side).
const MAX_ENCODED_LENGTH = 500_000;
const MAX_DECODED_LENGTH = 2_000_000;

export function decodeSharePayload(data: string): SharedCoursePayload | null {
  if (data.length > MAX_ENCODED_LENGTH) return null;
  try {
    const bytes = base64UrlDecode(data);
    const json = inflate(bytes, { toText: true });
    if (json.length > MAX_DECODED_LENGTH) return null;
    return JSON.parse(json) as SharedCoursePayload;
  } catch {
    return null;
  }
}
