import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { WhitepaperDocument } from "@/lib/reports/whitepaper/whitepaper-document";

/**
 * GET /api/whitepaper
 *
 * Public download of the short Endeavrly whitepaper PDF — a distributable
 * artifact for interest groups (schools, youth orgs, funders, partners).
 * No auth: it's marketing collateral, deliberately shareable.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const buffer = (await renderToBuffer(<WhitepaperDocument />)) as Buffer;
    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        // inline so it previews in-browser; download keeps a sensible filename.
        "Content-Disposition": 'inline; filename="endeavrly-whitepaper.pdf"',
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (err) {
    console.error("[whitepaper] render failed", err);
    return NextResponse.json({ error: "Failed to generate whitepaper" }, { status: 500 });
  }
}
