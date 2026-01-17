import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Sparkles } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-blue-500/5" />
      {/* Blobs hidden on mobile for performance */}
      <div className="hidden sm:block absolute top-20 -left-4 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="hidden sm:block absolute top-20 -right-4 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />

      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 relative">
            <Mail className="h-8 w-8 text-primary animate-pulse" />
            <Sparkles className="h-4 w-4 text-primary absolute -top-1 -right-1 animate-pulse" />
          </div>
          <CardTitle className="text-center text-2xl">Check your email</CardTitle>
          <CardDescription className="text-center text-base">
            We sent you a magic link to sign in. Click the link in your email to
            continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
            <p className="text-center text-sm text-muted-foreground">
              The link will expire in 24 hours for security reasons.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
