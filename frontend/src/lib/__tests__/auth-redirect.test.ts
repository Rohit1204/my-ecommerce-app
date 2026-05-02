import { describe, expect, it } from "vitest";
import { safeInternalPath } from "@/lib/auth-redirect";

describe("safeInternalPath", () => {
  it("allows same-origin relative paths", () => {
    expect(safeInternalPath("/checkout")).toBe("/checkout");
    expect(safeInternalPath("/login?next=%2F")).toBe("/login?next=%2F");
  });

  it("rejects open redirects", () => {
    expect(safeInternalPath("//evil.com")).toBeUndefined();
    expect(safeInternalPath("https://evil.com")).toBeUndefined();
    expect(safeInternalPath("")).toBeUndefined();
    expect(safeInternalPath(null)).toBeUndefined();
  });
});
