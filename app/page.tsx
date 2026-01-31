'use client'

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'

export default function LandingPage() {
    const { scrollY } = useScroll()
    const y1 = useTransform(scrollY, [0, 500], [0, 200])
    const y2 = useTransform(scrollY, [0, 500], [0, -150])
    const rotate1 = useTransform(scrollY, [0, 500], [0, 20])

    return (
        <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden font-sans selection:bg-blue-100">

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-white/20 transition-all shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 flex items-center justify-center">
                            <img src="/logo.png" alt="HexaMate" className="max-w-full max-h-full object-contain" />
                        </div>
                        <span className="font-bold text-2xl tracking-tight">HexaMate</span>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/login" className="px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">Sign In</Link>
                        <Link href="/register" className="px-5 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 px-4">
                {/* Floating Background Elements */}
                <motion.div style={{ y: y1, rotate: rotate1 }} className="absolute top-20 left-[10%] w-64 h-64 bg-blue-100 rounded-[3rem] mix-blend-multiply filter blur-3xl opacity-60 z-0 pointer-events-none" />
                <motion.div style={{ y: y2 }} className="absolute bottom-20 right-[10%] w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 z-0 pointer-events-none" />

                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-br from-gray-900 to-gray-600">
                            Intelligence, <br />
                            <span className="text-blue-600">Reimagined.</span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        HexaMate is your next-generation AI companion. Built for students, creating the future with clean aesthetics and powerful logic.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link href="/register" className="px-8 py-4 rounded-full bg-black text-white font-semibold text-lg hover:bg-gray-900 hover:scale-105 transition-all shadow-xl">
                            Experience HexaMate
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4 bg-gray-50/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Powerful AI Features</h2>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">Everything you need to supercharge your productivity and scale your workflows efficiently.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="group p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">Natural Language Processing</h3>
                            <p className="text-gray-500 leading-relaxed">Understand and generate human-like text instantly for emails, reports, and creative writing.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:border-purple-200 transition-all duration-300 hover:-translate-y-1">
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-600 transition-colors">Real-time Data Analysis</h3>
                            <p className="text-gray-500 leading-relaxed">Get actionable insights from your data as it happens with predictive modeling and charts.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:border-green-200 transition-all duration-300 hover:-translate-y-1">
                            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 text-green-600 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 group-hover:text-green-600 transition-colors">Highly Optimized LLM</h3>
                            <p className="text-gray-500 leading-relaxed">HexaMate is a highly optimized, natural-language large language model integrated with the Gemini API.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 px-4 bg-white relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none" />

                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Loved by Innovators</h2>
                        <p className="text-xl text-gray-500">See what others are creating with HexaMate.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Testimonial 1 */}
                        <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex text-yellow-500 mb-4">
                                {[1, 2, 3, 4, 5].map((s) => <svg key={s} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                            </div>
                            <p className="text-gray-600 mb-6 italic">"HexaMate completely transformed how I study. The explanations are crystal clear and the interface is just beautiful."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                                <div>
                                    <p className="font-bold text-gray-900">Alex M.</p>
                                    <p className="text-xs text-gray-500">Student</p>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex text-yellow-500 mb-4">
                                {[1, 2, 3, 4].map((s) => <svg key={s} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                                <svg className="w-5 h-5 fill-current text-gray-300" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            </div>
                            <p className="text-gray-600 mb-6 italic">"The real-time analysis feature helps me visualize data for my projects instantly. Highly recommended!"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                                <div>
                                    <p className="font-bold text-gray-900">Sarah J.</p>
                                    <p className="text-xs text-gray-500">Researcher</p>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex text-yellow-500 mb-4">
                                {[1, 2, 3, 4, 5].map((s) => <svg key={s} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                            </div>
                            <p className="text-gray-600 mb-6 italic">"Aesthetically pleasing and amazingly functional. It makes coding and writing so much easier."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                                <div>
                                    <p className="font-bold text-gray-900">David R.</p>
                                    <p className="text-xs text-gray-500">Developer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-24 px-4 bg-gray-900 text-white relative">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-8">Get in Touch</h2>
                    <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/10">
                        <form className="space-y-6 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Name</label>
                                    <input type="text" className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                                    <input type="email" className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500" placeholder="john@example.com" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Message</label>
                                <textarea rows={4} className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500" placeholder="How can we help?"></textarea>
                            </div>
                            <button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-900/50">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 text-center text-gray-400 text-sm bg-black border-t border-gray-800">
                <p>© 2026 HexaMate AI. School Project Exhibition.</p>
            </footer>
        </div>
    )
}
