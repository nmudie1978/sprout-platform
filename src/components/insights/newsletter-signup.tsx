"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  CheckCircle2,
  Loader2,
  Bell,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const industries = [
  { id: "tech", label: "Tech & AI", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  { id: "green", label: "Grønn Energi", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
  { id: "health", label: "Helse", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  { id: "creative", label: "Kreativ", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
];

export function NewsletterSignup() {
  const { data: session } = useSession();
  const [email, setEmail] = useState(session?.user?.email || "");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("weekly");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const toggleIndustry = (industryId: string) => {
    if (selectedIndustries.includes(industryId)) {
      setSelectedIndustries(selectedIndustries.filter((id) => id !== industryId));
    } else {
      setSelectedIndustries([...selectedIndustries, industryId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Vennligst oppgi e-postadresse");
      return;
    }

    if (selectedIndustries.length === 0) {
      toast.error("Velg minst én bransje");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/insights/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          industries: selectedIndustries,
          frequency,
        }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        toast.success("Du er nå påmeldt nyhetsbrevet!");
      } else {
        const data = await response.json();
        toast.error(data.error || "Kunne ikke melde på. Prøv igjen.");
      }
    } catch (error) {
      toast.error("Noe gikk galt. Prøv igjen.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <Card className="border-2 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-500" />
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="font-bold text-lg mb-2">Du er påmeldt!</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Vi sender deg {frequency === "weekly" ? "ukentlige" : "månedlige"} oppdateringer
            om {selectedIndustries.map((id) => industries.find((i) => i.id === id)?.label).join(", ")}.
          </p>
          <Button variant="outline" onClick={() => setIsSubscribed(false)}>
            Endre preferanser
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary to-purple-500" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="h-5 w-5 text-primary" />
          Industry Newsletter
        </CardTitle>
        <CardDescription>
          Get personalized job market updates delivered to your inbox
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">E-postadresse</label>
            <Input
              type="email"
              placeholder="din@epost.no"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Industry Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Hvilke bransjer er du interessert i?
            </label>
            <div className="flex flex-wrap gap-2">
              {industries.map((industry) => (
                <button
                  key={industry.id}
                  type="button"
                  onClick={() => toggleIndustry(industry.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border-2 ${
                    selectedIndustries.includes(industry.id)
                      ? `${industry.color} border-transparent`
                      : "bg-background border-muted hover:border-primary/50"
                  }`}
                >
                  {selectedIndustries.includes(industry.id) && (
                    <CheckCircle2 className="h-3 w-3 inline mr-1" />
                  )}
                  {industry.label}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Hvor ofte?</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFrequency("weekly")}
                className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                  frequency === "weekly"
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <Bell className="h-4 w-4 mx-auto mb-1" />
                <div className="text-sm font-medium">Ukentlig</div>
                <div className="text-[10px] text-muted-foreground">Hver mandag</div>
              </button>
              <button
                type="button"
                onClick={() => setFrequency("monthly")}
                className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                  frequency === "monthly"
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <Mail className="h-4 w-4 mx-auto mb-1" />
                <div className="text-sm font-medium">Månedlig</div>
                <div className="text-[10px] text-muted-foreground">1. hver måned</div>
              </button>
            </div>
          </div>

          {/* What you'll get */}
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              Hva du får:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Nye jobbmuligheter i dine bransjer</li>
              <li>• Lønnstrender og markedsoppdateringer</li>
              <li>• Tips til karriereutvikling</li>
              <li>• Kommende events og jobbmesser</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Melder på...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Meld meg på
              </>
            )}
          </Button>

          <p className="text-[10px] text-muted-foreground text-center">
            Du kan når som helst melde deg av. Vi deler aldri e-posten din.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
