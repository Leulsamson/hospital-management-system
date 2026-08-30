"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
    >
      Sign out
    </button>
  );
}
