"use client";

// Shared Framer Motion Physics & Transitions

export const springTransition = {
  type: "spring",
  stiffness: 260,
  damping: 24,
};

export const hoverLiftProps = {
  whileHover: { y: -3, scale: 1.01 },
  whileTap: { scale: 0.97 },
};

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const slideUpVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, y: -12, transition: { duration: 0.18 } },
};

export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: springTransition },
  exit: { opacity: 0, scale: 0.94, transition: { duration: 0.18 } },
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};
