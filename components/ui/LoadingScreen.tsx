"use client";

import { motion } from "framer-motion";

interface LoadingScreenProps {
    message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md"
        >
            <div className="relative flex flex-col items-center">
                {/* Animated Rings */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: 360,
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full"
                />

                {/* Inner Pulse */}
                <motion.div
                    animate={{
                        scale: [0.8, 1, 0.8],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute inset-0 m-auto w-8 h-8 bg-blue-600 rounded-full shadow-lg shadow-blue-500/50"
                />
            </div>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-gray-900 font-bold tracking-widest text-sm uppercase"
            >
                {message}
            </motion.p>
        </motion.div>
    );
}
