"use client";

import { Badge } from "@/components/ui/badge";

interface Props {
  published: boolean;
}

export function StatusBadge({ published }: Props) {
  return <Badge variant={published ? "default" : "secondary"}>{published ? "Published" : "Draft"}</Badge>;
}
