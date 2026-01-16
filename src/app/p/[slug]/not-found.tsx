import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center">
          <div className="mb-4 text-6xl">🔒</div>
          <h2 className="mb-2 text-2xl font-bold">Profile Not Found</h2>
          <p className="mb-6 text-muted-foreground">
            This profile doesn't exist or is set to private.
          </p>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
