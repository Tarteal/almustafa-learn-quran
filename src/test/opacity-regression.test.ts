import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Visual regression guard:
 * Non-home pages and their dashboard/admin components must keep text at full
 * opacity. Any `text-foreground/NN` or `text-background/NN` class (where NN is
 * a Tailwind opacity step less than 100) is treated as drift and fails the
 * test. The home page (`src/pages/Index.tsx`) and shared marketing components
 * under `src/components/site/**` are intentionally excluded — they own their
 * own design language.
 */

const ROOT = join(process.cwd(), "src");

const INCLUDE_DIRS = [
  join(ROOT, "pages"),
  join(ROOT, "components", "dashboard"),
  join(ROOT, "auth"),
];

const EXCLUDE_FILES = new Set<string>([
  join(ROOT, "pages", "Index.tsx"),
]);

const EXCLUDE_DIRS = [
  join(ROOT, "components", "site"),
  join(ROOT, "components", "ui"),
];

const OPACITY_PATTERN =
  /\btext-(?:foreground|background)\/(\d{1,2})\b/g;

function walk(dir: string, files: string[] = []): string[] {
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return files;
  }
  for (const name of entries) {
    const full = join(dir, name);
    if (EXCLUDE_DIRS.some((d) => full === d || full.startsWith(d + "/"))) continue;
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, files);
    } else if (/\.(tsx?|jsx?)$/.test(name) && !EXCLUDE_FILES.has(full)) {
      files.push(full);
    }
  }
  return files;
}

describe("opacity regression guard (non-home pages)", () => {
  const files = INCLUDE_DIRS.flatMap((d) => walk(d));

  it("scans at least one source file", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("contains no text-foreground/NN or text-background/NN drift", () => {
    const offenders: string[] = [];

    for (const file of files) {
      const src = readFileSync(file, "utf8");
      const lines = src.split("\n");
      lines.forEach((line, i) => {
        OPACITY_PATTERN.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = OPACITY_PATTERN.exec(line)) !== null) {
          // Only steps below 100 are drift. Tailwind's full opacity is no suffix.
          const step = Number(m[1]);
          if (step < 100) {
            offenders.push(
              `${relative(process.cwd(), file)}:${i + 1}  →  ${m[0]}`
            );
          }
        }
      });
    }

    if (offenders.length > 0) {
      throw new Error(
        `Found ${offenders.length} non-home opacity drift(s). ` +
          `Replace with full-opacity tokens (e.g. text-foreground):\n` +
          offenders.map((o) => `  • ${o}`).join("\n")
      );
    }
  });
});
