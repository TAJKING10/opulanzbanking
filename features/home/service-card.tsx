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
}

export function ServiceCard({
  title,
  description,
  image,
  href,
  ctaLabel = "Learn More",
  className,
}: ServiceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className={cn("h-full", className)}
    >
      <Card className="card-hover group h-full overflow-hidden border-none">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="p-6">
          <h3 className="mb-3 text-xl font-bold text-brand-dark">{title}</h3>
          <p className="mb-6 text-sm text-brand-grayMed">{description}</p>
          <Button
            asChild
            variant="link"
            className="group/btn p-0 text-brand-gold"
          >
            <Link href={href}>
              {ctaLabel}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
