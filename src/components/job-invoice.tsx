"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Printer,
  Download,
  FileText,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface Invoice {
  invoiceNumber: string;
  issueDate: string;
  employer: {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
  };
  worker: {
    displayName: string;
    fullName: string;
    email: string;
  } | null;
  job: {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    scheduledDate: string | null;
    scheduledTime: string | null;
    duration: string | null;
    completedAt: string | null;
  };
  payment: {
    amount: number;
    payType: string;
    status: string;
    paidAt: string | null;
  };
  generatedAt: string;
}

const categoryLabels: Record<string, string> = {
  BABYSITTING: "Babysitting",
  DOG_WALKING: "Dog Walking",
  SNOW_CLEARING: "Snow Clearing",
  CLEANING: "Cleaning",
  DIY_HELP: "DIY Help",
  TECH_HELP: "Tech Help",
  ERRANDS: "Errands",
  OTHER: "Other",
};

export function JobInvoice({ jobId }: { jobId: string }) {
  const { data: invoice, isLoading, error } = useQuery<Invoice>({
    queryKey: ["invoice", jobId],
    queryFn: async () => {
      const response = await fetch(`/api/employer/invoice/${jobId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to load invoice");
      }
      return response.json();
    },
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !invoice) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Unable to generate invoice"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions - hidden when printing */}
      <div className="flex justify-end gap-2 print:hidden">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      {/* Invoice */}
      <Card className="print:shadow-none print:border-0">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
              <p className="text-muted-foreground mt-1">
                {invoice.invoiceNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Issue Date</p>
              <p className="font-medium">
                {format(new Date(invoice.issueDate), "MMMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* From */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                FROM
              </h3>
              <div className="space-y-1">
                <p className="font-semibold text-lg">
                  {invoice.employer.companyName}
                </p>
                {invoice.employer.contactName && (
                  <p className="text-muted-foreground">
                    {invoice.employer.contactName}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {invoice.employer.email}
                </p>
                {invoice.employer.phone && (
                  <p className="text-sm text-muted-foreground">
                    {invoice.employer.phone}
                  </p>
                )}
                {invoice.employer.address && (
                  <p className="text-sm text-muted-foreground">
                    {invoice.employer.address}
                  </p>
                )}
              </div>
            </div>

            {/* To */}
            {invoice.worker && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  TO (Worker)
                </h3>
                <div className="space-y-1">
                  <p className="font-semibold text-lg">
                    {invoice.worker.fullName}
                  </p>
                  {invoice.worker.displayName !== invoice.worker.fullName && (
                    <p className="text-muted-foreground">
                      @{invoice.worker.displayName}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {invoice.worker.email}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Job Details */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              SERVICE DETAILS
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-lg">{invoice.job.title}</p>
                  <Badge variant="secondary" className="mt-1">
                    {categoryLabels[invoice.job.category] || invoice.job.category}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(invoice.payment.amount)}
                </p>
              </div>

              {invoice.job.description && (
                <p className="text-sm text-muted-foreground">
                  {invoice.job.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                {invoice.job.location && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {invoice.job.location}
                  </span>
                )}
                {invoice.job.scheduledDate && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(invoice.job.scheduledDate), "MMM d, yyyy")}
                    {invoice.job.scheduledTime && ` at ${invoice.job.scheduledTime}`}
                  </span>
                )}
                {invoice.job.duration && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {invoice.job.duration}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Payment Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(invoice.payment.amount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary">
                  {formatCurrency(invoice.payment.amount)}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2 mt-2">
                {invoice.payment.status === "CONFIRMED" ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Paid
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>Generated on {format(new Date(invoice.generatedAt), "MMMM d, yyyy 'at' h:mm a")}</p>
            <p className="mt-1">Youth Platform - Connecting young workers with opportunities</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
