"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function SignupPage() {
  const supabase = supabaseBrowserClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignup = async (e: any) => {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/account");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-700 shadow-lg max-w-md w-full">
        
        <h1 className="text-3xl font-bold text-green-400 mb-6 text-center">
          Create Account
        </h1>

        {errorMsg && (
          <div className="bg-red-600 text-white p-3 rounded-lg text-sm mb-4">
            {errorMsg}
          </div>
        )}

        <form className="flex flex-col space-y-4" onSubmit={handleSignup}>
          <input
            type="email"
            placeholder="Email"
            className="bg-neutral-800 text-white px-4 py-3 rounded-xl border border-neutral-700 focus:ring-2 focus:ring-green-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="bg-neutral-800 text-white px-4 py-3 rounded-xl border border-neutral-700 focus:ring-2 focus:ring-green-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-xl transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-gray-400 text-center text-sm mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-green-400 underline">
            Login
          </a>
        </p>

      </div>
    </div>
  );
}
