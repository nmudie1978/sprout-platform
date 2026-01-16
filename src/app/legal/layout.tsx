import Link from "next/link";
import { Sprout, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b backdrop-blur-lg bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Sprout className="h-7 w-7 text-green-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              Sprout
            </span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/legal/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/legal/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legal/cookies" className="hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            © {new Date().getFullYear()} Sprout. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
