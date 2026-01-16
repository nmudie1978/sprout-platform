"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Briefcase,
  DollarSign,
  Users,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ExportOption {
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const exportOptions: ExportOption[] = [
  {
    type: "jobs",
    title: "All Jobs",
    description: "Export all your job postings with status, workers, and payment info",
    icon: <Briefcase className="h-6 w-6" />,
    color: "from-blue-500/20 to-blue-600/20",
  },
  {
    type: "spending",
    title: "Spending Report",
    description: "Export completed jobs with payment amounts and dates",
    icon: <DollarSign className="h-6 w-6" />,
    color: "from-green-500/20 to-green-600/20",
  },
  {
    type: "workers",
    title: "Worker History",
    description: "Export list of workers you've hired with job counts and totals",
    icon: <Users className="h-6 w-6" />,
    color: "from-purple-500/20 to-purple-600/20",
  },
];

export default function ExportPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    setDownloading(type);
    try {
      const response = await fetch(`/api/employer/export?type=${type}&format=csv`);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `${type}-export.csv`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Export downloaded successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/employer">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Export Data</h1>
          <p className="text-muted-foreground">
            Download your data as CSV files
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {exportOptions.map((option, index) => (
          <motion.div
            key={option.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-50 pointer-events-none`}
              />
              <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-background/80">
                    {option.icon}
                  </div>
                  <Badge variant="secondary">
                    <FileSpreadsheet className="h-3 w-3 mr-1" />
                    CSV
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3">{option.title}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent className="relative pt-0">
                <Button
                  className="w-full"
                  onClick={() => handleExport(option.type)}
                  disabled={downloading !== null}
                >
                  {downloading === option.type ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>CSV files</strong> can be opened in Excel, Google Sheets, or
            any spreadsheet application.
          </p>
          <p>
            <strong>Jobs export</strong> includes all jobs regardless of status -
            perfect for record keeping.
          </p>
          <p>
            <strong>Spending export</strong> only includes completed jobs and can
            be useful for tax purposes.
          </p>
          <p>
            <strong>Workers export</strong> shows aggregated data per worker -
            great for reviewing hiring patterns.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
