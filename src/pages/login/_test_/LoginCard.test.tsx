import { describe, it, expect } from "vitest";
import { loginUserSchema } from "@/lib/validation/schema";

describe("loginUserSchema", () => {
  it("accepts valid data", () => {
    const data = { username: "alice", password: "pw123456", remember: false };
    const parsed = loginUserSchema.parse(data);
    expect(parsed).toEqual(data);
  });

  it("rejects empty username", () => {
    const r = loginUserSchema.safeParse({
      username: "",
      password: "pw123",
      remember: false,
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const issue = r.error.issues.find((i) => i.path.join(".") === "username");
      expect(issue?.message).toBe("Username is required");
    }
  });

  it("rejects empty password", () => {
    const r = loginUserSchema.safeParse({
      username: "alice",
      password: "",
      remember: false,
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const issue = r.error.issues.find((i) => i.path.join(".") === "password");
      expect(issue?.message).toBe("Password is required");
    }
  });
});
