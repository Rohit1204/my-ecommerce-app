import { describe, expect, it } from "vitest";
import { isValidEmailFormat } from "@/lib/validation";

describe("isValidEmailFormat", () => {
  it("accepts typical addresses", () => {
    expect(isValidEmailFormat("a@b.co")).toBe(true);
    expect(isValidEmailFormat("  user@example.com  ")).toBe(true);
  });

  it("rejects empty and junk", () => {
    expect(isValidEmailFormat("")).toBe(false);
    expect(isValidEmailFormat("   ")).toBe(false);
    expect(isValidEmailFormat("no-at-sign")).toBe(false);
    expect(isValidEmailFormat("@nodomain.com")).toBe(false);
    expect(isValidEmailFormat("a@")).toBe(false);
  });
});
