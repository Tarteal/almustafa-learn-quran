/**
 * RLS regression tests.
 *
 * Verifies that the anon (unauthenticated) Supabase client cannot read or
 * write data it must never reach. These tests use only the publishable
 * (anon) key — no service-role secret is required.
 *
 * They lock in the policies fixed in the security scan:
 *   - enrollments: not readable / writable by anon
 *   - lessons: not readable by anon (authenticated-only)
 *   - lesson_materials: not readable by anon, even for published rows
 *   - lesson-materials storage bucket: anon cannot upload
 *   - teacher_availability: not readable by anon
 */
import { describe, it, expect, beforeAll } from "vitest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

let anon: SupabaseClient;

beforeAll(() => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in env",
    );
  }
  anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
});

/**
 * Helper: an RLS-locked table should return either an explicit permission
 * error OR an empty result set (PostgREST filters rows the policy hides).
 * Either response proves the data isn't leaking.
 */
function expectDenied(result: { data: unknown; error: unknown }, label: string) {
  const data = result.data as unknown[] | null;
  const error = result.error as { message?: string } | null;
  const denied =
    !!error || (Array.isArray(data) && data.length === 0) || data === null;
  if (!denied) {
    throw new Error(
      `${label}: expected RLS to deny anon access, got rows: ${JSON.stringify(
        data,
      )}`,
    );
  }
  expect(denied).toBe(true);
}

describe("RLS: enrollments", () => {
  it("anon cannot read any enrollments", async () => {
    const res = await anon.from("enrollments").select("id").limit(1);
    expectDenied(res, "enrollments select");
  });

  it("anon cannot insert an enrollment", async () => {
    const res = await anon.from("enrollments").insert({
      user_id: "00000000-0000-0000-0000-000000000000",
      course_id: "00000000-0000-0000-0000-000000000000",
    });
    expect(res.error).toBeTruthy();
  });

  it("anon cannot update enrollments", async () => {
    const res = await anon
      .from("enrollments")
      .update({ status: "active" })
      .eq("id", "00000000-0000-0000-0000-000000000000")
      .select();
    // Either an explicit error, or zero rows affected.
    const data = res.data as unknown[] | null;
    expect(!!res.error || (Array.isArray(data) && data.length === 0)).toBe(true);
  });
});

describe("RLS: lessons", () => {
  it("anon cannot read lessons (authenticated-only policy)", async () => {
    const res = await anon.from("lessons").select("id,is_published").limit(5);
    expectDenied(res, "lessons select");
  });
});

describe("RLS: lesson_materials", () => {
  it("anon cannot read lesson_materials", async () => {
    const res = await anon
      .from("lesson_materials")
      .select("id,is_published")
      .limit(5);
    expectDenied(res, "lesson_materials select");
  });

  it("anon cannot insert lesson_materials", async () => {
    const res = await anon.from("lesson_materials").insert({
      lesson_id: "00000000-0000-0000-0000-000000000000",
      title: "rls-test",
      file_path: "rls-test.pdf",
    });
    expect(res.error).toBeTruthy();
  });
});

describe("RLS: lesson-materials storage bucket", () => {
  it("anon cannot upload to the lesson-materials bucket", async () => {
    // Use raw fetch to avoid jsdom fetch/Blob quirks with the storage SDK.
    const path = `rls-test-${Date.now()}.txt`;
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/lesson-materials/${path}`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "text/plain",
        },
        body: "rls-test",
      },
    );
    await res.text();
    expect(res.ok).toBe(false);
    expect([401, 403]).toContain(res.status);
  }, 15000);
});

describe("RLS: teacher_availability", () => {
  it("anon cannot read teacher_availability (authenticated-only)", async () => {
    const res = await anon
      .from("teacher_availability")
      .select("id,teacher_id")
      .limit(5);
    expectDenied(res, "teacher_availability select");
  });
});
