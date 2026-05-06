"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail } from "lucide-react";

import { API_URL } from "@/lib/env";
import { saveAuthSession } from "@/lib/auth";
import type { CurrentUser } from "@/lib/current-user";

type LoginResponse = {
  access_token: string;
  token_type: string;
  user: CurrentUser;
};

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function updateField(name: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setErrorMessage("Sila masukkan emel dan password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      if (!res.ok) {
        const text = await res.text();

        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.detail || text);
        } catch {
          throw new Error(text || "Log masuk gagal.");
        }
      }

      const data = (await res.json()) as LoginResponse;

      saveAuthSession({
        accessToken: data.access_token,
        user: data.user,
      });

      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Log masuk gagal.";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-7 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                COCS Builder
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Log masuk ke sistem CIDB COCS.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 px-7 py-6">
          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Emel / ID Login
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="nama@cidb.gov.my"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Masukkan password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Sedang log masuk..." : "Log Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}
