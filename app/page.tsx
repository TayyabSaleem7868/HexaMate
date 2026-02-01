"use client";

import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import { useForm, ValidationError } from "@formspree/react";

export default function LandingPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const rotate1 = useTransform(scrollY, [0, 500], [0, 20]);
  const [state, handleSubmit] = useForm("mjgogoke");
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const isMessageValid = message.trim().length >= 10;

  const [user, setUser] = React.useState<any | null>(null);

  React.useEffect(() => {
    if (state.succeeded) {
      setShowSuccess(true);
    }
  }, [state.succeeded]);

  React.useEffect(() => {
    let mounted = true;
    const getSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) {
          if (mounted) setUser(null);
          return;
        }
        const data = await res.json();
        if (mounted) setUser(data.user || null);
      } catch (err) {
        if (mounted) setUser(null);
      }
    };

    getSession();
    const id = setInterval(getSession, 10000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden font-sans selection:bg-blue-100">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/">
              <span className="font-bold text-xl xs:text-2xl sm:text-2xl md:text-2xl tracking-tight">
                HexaMate
              </span>
            </Link>
          </div>
          <div className="flex gap-1.5 xs:gap-2 sm:gap-4">
            {user ? (
              <Link
                href="/chat"
                className="px-3 py-2 xs:px-4 xs:py-2 sm:px-5 sm:py-2 rounded-full bg-black text-white text-xs xs:text-sm sm:text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Open Chat
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 xs:px-4 xs:py-2 sm:px-5 sm:py-2 rounded-full text-xs xs:text-sm sm:text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 xs:px-4 xs:py-2 sm:px-5 sm:py-2 rounded-full bg-black text-white text-xs xs:text-sm sm:text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center pt-28 xs:pt-32 md:pt-20 px-4">
        {/* Floating Background Elements */}
        <motion.div
          style={{ y: y1, rotate: rotate1 }}
          className="absolute top-10 xs:top-20 left-[5%] xs:left-[10%] w-32 h-32 xs:w-64 xs:h-64 bg-blue-100 rounded-[2rem] xs:rounded-[3rem] mix-blend-multiply filter blur-2xl xs:blur-3xl opacity-60 z-0 pointer-events-none"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-10 xs:bottom-20 right-[5%] xs:right-[10%] w-48 h-48 xs:w-96 xs:h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-2xl xs:blur-3xl opacity-60 z-0 pointer-events-none"
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl xs:text-6xl sm:text-7xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 xs:mb-8 bg-clip-text text-transparent bg-linear-to-br from-gray-900 to-gray-600 leading-[1.1] selection:text-gray-900">
              Intelligence, <br />
              <span className="text-blue-600 selection:text-blue-600">
                Reimagined.
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            HexaMate is your next-generation AI companion. Built for students,
            creating the future with clean aesthetics and powerful logic.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 xs:gap-4 justify-center px-4"
          >
            <Link
              href={user ? "/chat" : "/register"}
              className="px-6 py-3.5 xs:px-8 xs:py-4 rounded-full bg-black text-white font-semibold text-base xs:text-lg hover:bg-gray-900 hover:scale-105 transition-all text-center"
            >
              Experience HexaMate
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 px-4 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful AI Features</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Everything you need to supercharge your productivity and scale
              your workflows efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-3xl bg-white border border-gray-100 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                Natural Language Processing
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Understand and generate human-like text instantly for emails,
                reports, and creative writing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-3xl bg-white border border-gray-100 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-600 transition-colors">
                Real-time Data Analysis
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Get actionable insights from your data as it happens with
                predictive modeling and charts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-3xl bg-white border border-gray-100 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 text-green-600 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-green-600 transition-colors">
                Highly Optimized LLM
              </h3>
              <p className="text-gray-500 leading-relaxed">
                HexaMate is a highly optimized, natural-language large language
                model integrated with the Gemini API.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-24 px-4 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Innovators</h2>
            <p className="text-lg md:text-xl text-gray-500">
              See what others are creating with HexaMate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Testimonial 1 */}
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex text-yellow-500 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">
                "HexaMate completely transformed how I study. The explanations
                are crystal clear and the interface is just beautiful."
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="/testimonials/1.png"
                  alt="Alex M."
                  className="w-12 h-12 rounded-full object-cover border border-gray-100 shrink-0"
                />
                <div>
                  <p className="font-bold text-gray-900 leading-none mb-1">
                    Alex M.
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Student</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex text-yellow-500 mb-4">
                {[1, 2, 3, 4].map((s) => (
                  <svg
                    key={s}
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <svg
                  className="w-5 h-5 fill-current text-gray-300"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-6 italic">
                "The real-time analysis feature helps me visualize data for my
                projects instantly. Highly recommended!"
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="/testimonials/2.png"
                  alt="Sarah J."
                  className="w-12 h-12 rounded-full object-cover border border-gray-100 shrink-0"
                />
                <div>
                  <p className="font-bold text-gray-900 leading-none mb-1">
                    Sarah J.
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Researcher
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex text-yellow-500 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">
                "Aesthetically pleasing and amazingly functional. It makes
                coding and writing so much easier."
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="/testimonials/3.png"
                  alt="David R."
                  className="w-12 h-12 rounded-full object-cover border border-gray-100 shrink-0"
                />
                <div>
                  <p className="font-bold text-gray-900 leading-none mb-1">
                    David R.
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Developer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-24 px-4 bg-gray-50/50 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
            Get in Touch
          </h2>
          <div className="bg-white p-8 rounded-3xl border border-gray-100">
            <form
              onSubmit={handleSubmit}
              className="space-y-4 xs:space-y-6 text-left"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder-gray-400 text-gray-800"
                    placeholder="John Doe"
                  />
                  <ValidationError
                    prefix="Name"
                    field="name"
                    errors={state.errors}
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder-gray-400 text-gray-800"
                    placeholder="john@example.com"
                  />
                  <ValidationError
                    prefix="Email"
                    field="email"
                    errors={state.errors}
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder-gray-400 text-gray-800 resize-none"
                  placeholder="How can we help?"
                ></textarea>
                <ValidationError
                  prefix="Message"
                  field="message"
                  errors={state.errors}
                  className="text-red-500 text-xs mt-1"
                />
              </div>
              <button
                type="submit"
                disabled={state.submitting || !isMessageValid}
                className={`w-full py-4 rounded-xl font-bold transition-all ${isMessageValid
                    ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  } disabled:opacity-50`}
              >
                {state.submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-gray-500 text-sm bg-white border-t border-gray-100">
        <p>© 2026 HexaMate AI. All Rights Reserved.</p>
      </footer>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/5 backdrop-blur-sm"
              onClick={() => setShowSuccess(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white p-8 rounded-[2.5rem] border border-gray-100 max-w-sm w-full text-center"
            >
              <button
                onClick={() => setShowSuccess(false)}
                className="absolute top-6 right-6 p-2 rounded-xl hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600"
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
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                  <motion.svg
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="w-10 h-10 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Message Sent!
              </h3>
              <p className="text-gray-500 leading-relaxed mb-8 text-sm">
                Thank you for reaching out. HexaMate will be in touch with you
                shortly to assist with your inquiry.
              </p>

              <button
                onClick={() => setShowSuccess(false)}
                className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all active:scale-95 cursor-pointer"
              >
                Acknowledged
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
