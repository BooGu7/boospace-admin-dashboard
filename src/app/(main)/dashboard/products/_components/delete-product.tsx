"use client";

import { useTransition } from "react";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteProduct } from "@/actions/product.actions";
import { Button } from "@/components/ui/button";

interface Props {
  id: string;
}

export function DeleteProduct({ id }: Props) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this product?")) return;

    startTransition(async () => {
      try {
        await deleteProduct(id);

        toast.success("Deleted successfully");
      } catch (_e) {
        toast.error("Delete failed");
      }
    });
  }

  return (
    <Button size="icon" variant="destructive" disabled={pending} onClick={handleDelete}>
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
