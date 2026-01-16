"use client";

import { use } from "react";
import { JobInvoice } from "@/components/job-invoice";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function InvoicePage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);

  return (
    <div className="container max-w-3xl py-6 space-y-6">
      <div className="flex items-center gap-4 print:hidden">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/jobs/${jobId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Invoice</h1>
          <p className="text-muted-foreground">
            View and print job receipt
          </p>
        </div>
      </div>

      <JobInvoice jobId={jobId} />
    </div>
  );
}
