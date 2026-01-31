'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: string
    name: string
    email: string
    username: string
    role: string
    createdAt: string
    chatCount: number
}

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/admin/users')
                if (res.status === 401) {
                    router.push('/secret-admin-access-x9z')
                    return
                }
                if (res.status === 403) {
                    alert("Access Denied: Admins Only")
                    router.push('/')
                    return
                }

                if (res.ok) {
                    const data = await res.json()
                    setUsers(data)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    if (loading) return <div className="p-8 text-white bg-black min-h-screen">Loading mainframe...</div>

    return (
        <div className="min-h-screen bg-black text-white-400 font-mono p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8 border-b border-blue-800 pb-4">
                    <h1 className="text-3xl font-bold">HEXAMATE ADMIN PANEL</h1>
                    <button onClick={() => router.push('/')} className="px-4 py-2 border border-blue-600 hover:bg-blue-900 rounded cursor-pointer transition">
                        Exit to Frontend
                    </button>
                </header>

                <div className="bg-gray-900 rounded-lg overflow-hidden border border-blue-800 shadow-2xl">
                    <table className="w-full text-left">
                        <thead className="bg-blue-900 text-gray-300">
                            <tr>
                                <th className="p-4">USER ID</th>
                                <th className="p-4">USERNAME</th>
                                <th className="p-4">EMAIL</th>
                                <th className="p-4">ROLE</th>
                                <th className="p-4">CHATS</th>
                                <th className="p-4">JOINED</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-green-900/30">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-800 transition-colors">
                                    <td className="p-4 text-xs text-gray-500 font-sans">{user.id}</td>
                                    <td className="p-4 font-bold text-white">{user.username || '-'}</td>
                                    <td className="p-4">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-red-900 text-red-200' : 'bg-blue-900 text-blue-200'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">{user.chatCount}</td>
                                    <td className="p-4 text-sm text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && (
                        <div className="p-8 text-center text-gray-500">No users found in the matrix.</div>
                    )}
                </div>
            </div>
        </div>
    )
}
