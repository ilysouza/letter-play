import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./letterPlayRouter";

describe("Letter Play account security", () => {
  it("stores a salted password hash that validates the original password", async () => {
    const stored = await hashPassword("senha-de-teste");

    expect(stored).not.toContain("senha-de-teste");
    expect(stored.split(":")).toHaveLength(2);
    expect(await verifyPassword("senha-de-teste", stored)).toBe(true);
    expect(await verifyPassword("senha-incorreta", stored)).toBe(false);
  });

  it("generates different salts for the same password", async () => {
    const first = await hashPassword("mesma-senha");
    const second = await hashPassword("mesma-senha");

    expect(first).not.toBe(second);
    expect(await verifyPassword("mesma-senha", first)).toBe(true);
    expect(await verifyPassword("mesma-senha", second)).toBe(true);
  });
});
