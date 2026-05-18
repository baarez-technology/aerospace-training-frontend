"use client";

import { useEffect, useState } from "react";
import { useSpring, useTransform, motion } from "framer-motion";

interface CountUpProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function CountUp({
  value,
  duration = 2,
  suffix = "",
  prefix = "",
  className = "",
}: CountUpProps) {
  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });
  const displayValue = useTransform(spring, (current) => 
    `${prefix}${Math.round(current)}${suffix}`
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{displayValue}</motion.span>;
}
