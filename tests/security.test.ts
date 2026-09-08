import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "../src/lib/password";
import { rateLimit } from "../src/lib/rate-limit";

test("passwords are hashed and verified without exposing the original value", async () => {
  const hash = await hashPassword("Password123!");
  assert.notEqual(hash, "Password123!");
  assert.equal(await verifyPassword("Password123!", hash), true);
  assert.equal(await verifyPassword("wrong-password", hash), false);
});

test("rate limiting blocks requests after the configured limit", () => {
  const key = `test-${Date.now()}`;
  assert.equal(rateLimit(key, 2, 60_000), null);
  assert.equal(rateLimit(key, 2, 60_000), null);
  assert.equal(rateLimit(key, 2, 60_000)?.status, 429);
});
