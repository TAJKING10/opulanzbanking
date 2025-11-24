"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
  href: string;
  ctaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ServiceCard({
  title,
  description,
  image,
  href,
  ctaLabel = "Learn More",
  className,
  style,
}: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{
        y: -12,
        rotateX: 2,
        rotateY: 2,
        scale: 1.02,
      }}
      transition={{
        duration: 0.4,
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      className={cn("h-full perspective-1000", className)}
      style={{
        ...style,
        transformStyle: "preserve-3d",
      }}
    >
      <Link href={href} className="block h-full">
        <Card className="card-hover group h-full overflow-hidden border-none cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
            />
            <div className="absolute top-4 right-4 z-20 bg-brand-gold/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Explore →
            </div>
          </div>
          <CardContent className="p-6 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-gold to-brand-goldLight opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <h3 className="mb-3 text-xl font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{title}</h3>
            <p className="mb-6 text-sm text-brand-grayMed leading-relaxed">{description}</p>
            <div className="flex items-center text-brand-gold font-semibold group-hover:gap-3 transition-all">
              {ctaLabel}
              <ArrowRight className="ml-2 h-4 w-4 transition-all group-hover:translate-x-2 group-hover:scale-125" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
