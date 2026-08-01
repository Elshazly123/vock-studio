"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/admin-actions";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-sm px-5 py-24 text-center">
      <h1 className="font-black tracking-tight text-xl text-neutral-50">لوحة التحكم</h1>
      <input
        placeholder="اسم المستخدم"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mt-4 w-full rounded-sm border border-neutral-800 bg-neutral-900 px-4 py-3 text-center text-sm text-neutral-100"
      />
      <input
        type="password"
        placeholder="كلمة السر"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        className="mt-3 w-full rounded-sm border border-neutral-800 bg-neutral-900 px-4 py-3 text-center text-sm text-neutral-100"
      />
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <button onClick={handleLogin} disabled={loading} className="btn-primary mt-4 w-full disabled:opacity-50">
        {loading ? "جاري الدخول..." : "دخول"}
      </button>
    </section>
  );
}
