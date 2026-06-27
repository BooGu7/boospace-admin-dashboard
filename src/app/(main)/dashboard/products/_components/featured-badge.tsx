"use client";

import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface Props {
  featured: boolean;
}

export function FeaturedBadge({ featured }: Props) {
  if (!featured) return null;

  return (
    <Badge>
      <Star className="mr-1 h-3 w-3 fill-current" />
      Featured
    </Badge>
  );
}
