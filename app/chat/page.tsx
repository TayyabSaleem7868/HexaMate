"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Message {
  role: "user" | "model";
  content: string;
}

interface ChatSummary {
  id: string;
  title: string;
  updatedAt: string;
  lastMessage?: string | null;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loadingChats, setLoadingChats] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(false);
  const [user, setUser] = useState<{
    id?: string;
    email?: string;
    name?: string;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    let mounted = true;
    const getSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        if (mounted) setUser(data.user || null);
      } catch (err) {
        console.error("Failed to fetch session", err);
      }
    };

    getSession();
    const id = setInterval(getSession, 10_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchChats(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchChats = async (q?: string) => {
    setLoadingChats(true);
    try {
      const url = q ? `/api/chat?q=${encodeURIComponent(q)}` : "/api/chat";
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        return;
      }
      const data = await res.json();
      setChats(data.chats || []);
    } catch (e) {
      console.error("Failed to fetch chats", e);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchChatMessages = async (id: string) => {
    try {
      const res = await fetch(`/api/chat?chatId=${encodeURIComponent(id)}`);
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        return;
      }
      const data = await res.json();
      const msgs =
        (data?.chat?.messages || []).map(
          (m: { role?: string; content?: string }) => ({
            role:
              (m.role ?? "").toString().toLowerCase() === "assistant"
                ? "model"
                : "user",
            content: m.content ?? "",
          }),
        ) || [];
      setMessages(msgs);
      setChatId(id);
    } catch (e) {
      console.error("Failed to fetch chat", e);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMsg }],
          chatId,
        }),
      });

      if (!res.ok) {
        let errorText = "";
        try {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const j = await res.json();
            errorText = j?.error?.message || j?.error || JSON.stringify(j);
          } else {
            errorText = await res.text();
          }
        } catch {
          errorText = "Unable to parse error body";
        }

        console.error("API /api/chat error", res.status, errorText);
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: `Error from server (${res.status}): ${errorText}`,
          },
        ]);
        return;
      }

      const data = await res.json();
      setChatId(data.chatId);
      setMessages((prev) => [...prev, { role: "model", content: data.text }]);

      fetchChats(search);
    } catch (error) {
      console.error("[client] /api/chat request failed", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            "Sorry, I encountered a network or client error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/chat/new", { method: "POST" });
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        return;
      }
      const data = await res.json();

      setChats((prev) => [
        {
          id: data.id,
          title: data.title,
          updatedAt: new Date().toISOString(),
          lastMessage: null,
        },
        ...prev,
      ]);
      setMessages([]);
      setChatId(data.id);
    } catch (e) {
      console.error("Failed to create chat", e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectChat = async (id: string) => {
    await fetchChatMessages(id);
  };

  const handleDeleteChat = async (id: string) => {
    try {
      const res = await fetch("/api/chat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: id }),
      });
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        return;
      }
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (chatId === id) {
        setChatId(null);
        setMessages([]);
      }
    } catch (e) {
      console.error("Failed to delete chat", e);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#F5F5F7] text-gray-800 font-sans">
      <nav className="absolute top-4 left-4 z-40">
        <AnimatePresence>
          {!showSidebar && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setShowSidebar(true)}
              className="md:hidden p-3 rounded-xl bg-white/80 backdrop-blur-md text-gray-800"
            >
              <svg
                className="w-7 h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </nav>

      {/* blobs - Hidden on mobile for performance */}
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="hidden md:block absolute top-20 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 40, 0], x: [0, -30, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="hidden md:block absolute bottom-10 right-10 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none"
      />

      <main className="relative z-10 flex flex-col md:flex-row items-stretch h-full p-0 sm:p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto overflow-hidden">
        {/* Sidebar responsive */}
        {/* Desktop */}
        <aside className="hidden md:block w-72 mr-6 shrink-0 h-full overflow-hidden">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4 pl-2">
                <Link href="/">
                  <span className="font-bold text-2xl text-gray-800">
                    HexaMate
                  </span>
                </Link>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleNewChat}
                  disabled={isCreating}
                  className="w-full flex items-center gap-2 md:gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-sm text-gray-800 cursor-pointer font-medium"
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>New chat</span>
                </button>

                <div className="relative">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search chats..."
                    className="w-full pl-10 pr-3 py-2.5 rounded-md bg-gray-50 border border-gray-100 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-3 text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                  History
                </div>
                <div className="flex-1 overflow-y-auto mt-2 pr-2 space-y-1 scrollbar-hide">
                  {loadingChats && (
                    <div className="px-4 py-8 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                      />
                      Loading chats...
                    </div>
                  )}
                  {!loadingChats && chats.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-gray-400">
                      No chats yet. Start a conversation!
                    </div>
                  )}
                  {chats.map((c) => (
                    <div
                      key={c.id}
                      className={`group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all ${c.id === chatId ? "bg-blue-50/50 border border-blue-100/50" : "border border-transparent hover:border-gray-100"}`}
                    >
                      <div
                        onClick={() => handleSelectChat(c.id)}
                        className="flex-1 pr-2 cursor-pointer"
                      >
                        <div className="font-semibold text-sm text-gray-800 truncate">
                          {c.title}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate mt-0.5">
                          {c.lastMessage ?? "No messages"}
                        </div>
                      </div>
                      <button
                        title="Delete"
                        onClick={() => {
                          setDeleteTargetId(c.id);
                          setShowDeleteModal(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M15 7V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v2m-3 0h14"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-auto">
              <div className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold text-white">
                    {(user?.name || user?.email || user?.id || "U")
                      .toString()
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="max-w-[100px]">
                    <div className="font-bold text-gray-800 text-xs truncate">
                      {user?.name ?? user?.email ?? user?.id ?? "Guest"}
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium">
                      {user ? "Signed in" : "Not signed in"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile overlay sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                onClick={() => setShowSidebar(false)}
              />

              {/* Sidebar Content */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.3, ease: "circOut" }}
                className="md:hidden fixed inset-y-0 left-0 w-[80%] max-w-sm bg-white border-r border-gray-100 z-50 p-6 flex flex-col will-change-transform"
              >
                <div className="flex items-center justify-between mb-8 pl-1">
                  <Link href="/">
                    <span className="font-bold text-2xl text-gray-800 tracking-tight">
                      HexaMate
                    </span>
                  </Link>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      className="w-7 h-7 text-gray-700"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
                  <button
                    onClick={() => {
                      handleNewChat();
                      setShowSidebar(false);
                    }}
                    disabled={isCreating}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-base text-gray-800 cursor-pointer font-semibold"
                  >
                    <svg
                      className="w-6 h-6 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>New chat</span>
                  </button>

                  <div className="mt-6 text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                    Recent History
                  </div>

                  <div className="space-y-1 overflow-y-auto pr-2 scrollbar-hide max-h-[40vh]">
                    {chats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all ${chat.id === chatId ? "bg-blue-50/50 border border-blue-100/50" : "border border-transparent"}`}
                      >
                        <div
                          onClick={() => {
                            handleSelectChat(chat.id);
                            setShowSidebar(false);
                          }}
                          className="flex-1 pr-2 cursor-pointer"
                        >
                          <div className="font-semibold text-[15px] text-gray-800 truncate">
                            {chat.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate mt-0.5">
                            {chat.lastMessage ?? "No messages"}
                          </div>
                        </div>
                        <button
                          title="Delete"
                          onClick={() => {
                            setDeleteTargetId(chat.id);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M15 7V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v2m-3 0h14"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-auto">
                  <div className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold text-white">
                        {(user?.name || user?.email || user?.id || "U")
                          .toString()
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="max-w-[120px]">
                        <div className="font-bold text-gray-800 text-sm truncate">
                          {user?.name ?? user?.email ?? user?.id ?? "Guest"}
                        </div>
                        <div className="text-[11px] text-gray-500 font-medium">
                          {user ? "Signed in" : "Not signed in"}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Chat area */}
        <div className="flex-1 h-full min-h-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex-1 flex flex-col bg-white sm:bg-white/80 sm:backdrop-blur-xl rounded-none sm:rounded-2xl md:rounded-3xl lg:rounded-4xl border-none sm:border sm:border-white/30 overflow-hidden h-full"
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <p className="font-light text-lg">
                    How can I help you today?
                  </p>
                </div>
              )}

              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`
                                  max-w-[92%] xs:max-w-[85%] md:max-w-[75%] px-5 md:px-6 py-3.5 md:py-4 rounded-2xl md:rounded-3xl text-base md:text-sm leading-relaxed
                                  ${
                                    msg.role === "user"
                                      ? "bg-blue-600 text-white rounded-br-none"
                                      : "bg-white text-gray-700 rounded-bl-none border border-gray-100"
                                  }
                            `}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white px-6 py-4 rounded-3xl rounded-bl-lg border border-gray-100 flex gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-2 h-2 bg-gray-300 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                      className="w-2 h-2 bg-gray-300 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                      className="w-2 h-2 bg-gray-300 rounded-full"
                    />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 xs:p-6 bg-white/40 border-t border-white/30 backdrop-blur-md">
              <form
                onSubmit={handleSubmit}
                className="relative max-w-4xl mx-auto"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="w-full pl-5 md:pl-6 pr-14 md:pr-16 py-3.5 md:py-4 rounded-full bg-white border border-gray-100 outline-none transition-all placeholder-gray-400 text-base focus:border-blue-200"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-2 p-2.5 bg-blue-600 cursor-pointer text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all active:scale-95"
                >
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 transform rotate-90"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
            >
              <motion.div
                className="absolute inset-0 bg-black/40 cursor-pointer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTargetId(null);
                }}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ duration: 0.18 }}
                className="bg-white rounded-xl p-6 z-10 w-[90%] max-w-md border border-gray-100"
              >
                <h3 className="text-lg font-semibold mb-2">Delete chat</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete this chat? This cannot be
                  undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteTargetId(null);
                    }}
                    className="px-4 py-2 rounded-md bg-gray-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (deleteTargetId)
                        await handleDeleteChat(deleteTargetId);
                      setShowDeleteModal(false);
                      setDeleteTargetId(null);
                    }}
                    className="px-4 py-2 rounded-md bg-red-600 text-white cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
