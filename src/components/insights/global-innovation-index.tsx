"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Globe2,
  ExternalLink,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";

// WIPO Global Innovation Index Report
// Update this URL when new editions are released
const GII_REPORT_URL =
  "https://www.wipo.int/edocs/pubdocs/en/wipo-pub-2000-2024-en-main-report-global-innovation-index-2024-17th-edition.pdf";
const GII_FALLBACK_URL =
  "https://www.wipo.int/edocs/pubdocs/en/wipo-pub-2000-2023-en-main-report-global-innovation-index-2023-16th-edition.pdf";
const GII_LANDING_PAGE = "https://www.wipo.int/global_innovation_index/en/";

export function GlobalInnovationIndex() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  // Use 2024 URL, fallback to 2023 if needed
  const pdfUrl = pdfError ? GII_FALLBACK_URL : GII_REPORT_URL;

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-blue-500" />
              Global Innovation Index
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setIsExpanded(true)}
              >
                <Maximize2 className="h-3.5 w-3.5 mr-1" />
                Expand
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                asChild
              >
                <a
                  href={GII_LANDING_PAGE}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  WIPO
                </a>
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Annual report ranking countries by innovation capability
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative bg-muted/30 border-t">
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              className="w-full h-[280px] border-0"
              title="Global Innovation Index Report"
              onError={() => setPdfError(true)}
            />
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
          <div className="p-3 border-t bg-muted/20">
            <p className="text-[10px] text-muted-foreground">
              Source: World Intellectual Property Organization (WIPO) • Updated annually
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Expanded Modal View */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Globe2 className="h-5 w-5 text-blue-500" />
                <div>
                  <h2 className="font-semibold">Global Innovation Index</h2>
                  <p className="text-xs text-muted-foreground">
                    WIPO Annual Report
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in new tab
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 p-4">
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1`}
                className="w-full h-full border rounded-lg"
                title="Global Innovation Index Report - Expanded"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
