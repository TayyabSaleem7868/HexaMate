"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
  chatCount: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (res.status === 401) {
          router.push("/secret-admin-access-x9z");
          return;
        }
        if (res.status === 403) {
          alert("Access Denied: Admins Only");
          router.push("/");
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-black">
        Loading the panel...
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-black font-mono p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-gray-300 pb-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
            HEXAMATE ADMIN PANEL
          </h1>
          <button
            onClick={() => router.push("/")}
            className="w-full sm:w-auto px-4 py-2 border border-gray-400 hover:bg-[#101828] hover:text-white cursor-pointer rounded transition"
          >
            Exit Admin Panel
          </button>
        </header>

        <div className="hidden md:block bg-gray-50 rounded-lg border border-gray-200 shadow-md overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3">USER ID</th>
                <th className="p-3">USERNAME</th>
                <th className="p-3">EMAIL</th>
                <th className="p-3">ROLE</th>
                <th className="p-3">CHATS</th>
                <th className="p-3">JOINED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-100 transition-colors">
                  <td className="p-3 text-sm text-gray-500">{user.id}</td>
                  <td className="p-3 font-bold text-gray-800">{user.username || "-"}</td>
                  <td className="p-3 text-gray-700 break-all">{user.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${user.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                        }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700">{user.chatCount}</td>
                  <td className="p-3 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-8 text-center text-gray-500">No users found in the system.</div>
          )}
        </div>

        {/* Cards*/}
        <div className="md:hidden space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-gray-50 border border-gray-200 rounded-lg shadow p-4 space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800 truncate">{user.username || "-"}</span>
                <span
                  className={`px-2 py-1 rounded text-xs ${user.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                    }`}
                >
                  {user.role}
                </span>
              </div>
              <div className="text-gray-500 text-sm break-all">ID: {user.id}</div>
              <div className="text-gray-700 text-sm break-all">Email: {user.email}</div>
              <div className="text-gray-700 text-sm">Chats: {user.chatCount}</div>
              <div className="text-gray-500 text-sm">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="p-8 text-center text-gray-500">No users found in the system.</div>
          )}
        </div>
      </div>
    </div>
  );
}
