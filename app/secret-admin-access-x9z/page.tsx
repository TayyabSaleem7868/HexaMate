"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user.id) router.push("/admin/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Connection failed");
      }
    } catch {
      setError("Error logging in");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FEFFFF] overflow-hidden px-4">
      <div className="absolute inset-x-0 bottom-0 z-0 flex justify-center gap-56 pb-8">
        <div className="w-[560px] h-[560px] bg-[#F8F2FF] rounded-full blur-[20px] opacity-140 animate-blob-1" />
        <div className="w-[560px] h-[560px] bg-[#EDF4FE] rounded-full blur-[20px] opacity-140 animate-blob-2" />
      </div>

      {/* CARD */}
      <div
        className="
          relative z-10 w-full max-w-md rounded-2xl
          border border-gray-300/100
          bg-white/20
          backdrop-blur-[28px]
          shadow-[0_20px_40px_rgba(0,0,0,0.08)]
          p-6 xs:p-8
        "
      >
        <h1 className="text-2xl font-semibold mb-6 text-black">ADMIN ACCESS</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="ADMIN NUMBER"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="
              w-full p-3 rounded-xl
              bg-white/60
              border border-[#000000]/80
              text-black placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-black/20
            "
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="ADMIN SECRET"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full p-3 rounded-xl
                bg-white/60
                border border-[#000000]/80
                text-black placeholder-gray-500
                pr-10
                focus:outline-none focus:ring-2 focus:ring-black/20
              "
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-600 hover:text-black"
            >
              {showPassword ? (
                // Eye Off
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  cursor="pointer"
                >
                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                </svg>
              ) : (
                // Eye On
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  cursor="pointer"
                >
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            className="
              w-full p-3 rounded-xl
              border border-black
              bg-transparent
              text-black
              cursor-pointer
              transition-colors
              hover:bg-black hover:text-white
            "
          >
            ADMIN LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}
