"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroProps {
  title: string;
  subtitle?: string;
  primaryCta?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryCta?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  tertiaryCta?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function Hero({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  tertiaryCta,
  className,
}: HeroProps) {
  return (
    <section
      className={cn(
        "hero-gradient relative overflow-hidden py-12 md:py-16 lg:py-20",
        className
      )}
    >
      <div className="container relative z-10 mx-auto max-w-6xl 3xl:max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 3xl:text-8xl">
            {title}
          </h1>
          {subtitle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-balance text-lg text-white/90 md:text-xl"
            >
              {subtitle.split("\n\n").map((part, i) => (
                <p key={i} className={i > 0 ? "mt-4" : undefined}>{part}</p>
              ))}
            </motion.div>
          )}
          {(primaryCta || secondaryCta || tertiaryCta) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row flex-wrap"
            >
              {primaryCta && (
                primaryCta.onClick ? (
                  <Button
                    size="lg"
                    variant="default"
                    className="min-w-48"
                    onClick={primaryCta.onClick}
                  >
                    {primaryCta.label}
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    variant="default"
                    className="min-w-48"
                  >
                    <Link href={primaryCta.href!}>{primaryCta.label}</Link>
                  </Button>
                )
              )}
              {secondaryCta && (
                secondaryCta.onClick ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="min-w-48 border-white text-white hover:bg-white/10"
                    onClick={secondaryCta.onClick}
                  >
                    {secondaryCta.label}
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="min-w-48 border-white text-white hover:bg-white/10"
                  >
                    <Link href={secondaryCta.href!}>{secondaryCta.label}</Link>
                  </Button>
                )
              )}
              {tertiaryCta && (
                tertiaryCta.onClick ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="min-w-48 border-white text-white hover:bg-white/10"
                    onClick={tertiaryCta.onClick}
                  >
                    {tertiaryCta.label}
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="min-w-48 border-white text-white hover:bg-white/10"
                  >
                    <Link href={tertiaryCta.href!}>{tertiaryCta.label}</Link>
                  </Button>
                )
              )}
            </motion.div>
          )}
        </div>
      </div>
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-goldDark/20 via-transparent to-transparent" />
    </section>
  );
}
