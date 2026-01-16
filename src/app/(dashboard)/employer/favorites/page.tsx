"use client";

import { FavoriteWorkersList } from "@/components/favorite-workers-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/employer">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Favorite Workers</h1>
          <p className="text-muted-foreground">
            Your saved workers for quick hiring
          </p>
        </div>
      </div>

      <FavoriteWorkersList />
    </div>
  );
}
