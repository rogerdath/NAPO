"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface AnimatedContainerProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    isItem?: boolean;
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function AnimatedContainer({
    children,
    isItem = false,
    ...props
}: AnimatedContainerProps) {
    return (
        <motion.div
            variants={isItem ? item : container}
            initial="hidden"
            animate="show"
            {...props}
        >
            {children}
        </motion.div>
    );
} 