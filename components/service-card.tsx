"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
  href: string;
  ctaLabel?: string;
  exploreLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ServiceCard({
  title,
  description,
  image,
  href,
  ctaLabel = "Learn More",
  exploreLabel = "Explore →",
  className,
  style,
}: ServiceCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-7, 7]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = (mouseX / width - 0.5);
    const yPct = (mouseY / height - 0.5);

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        ease: "easeOut"
      }}
      style={{
        ...style,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("h-full perspective-1000", className)}
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
              {exploreLabel}
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
