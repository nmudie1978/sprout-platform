import { NextResponse } from "next/server";
import { renderToBuffer, Font } from "@react-pdf/renderer";
import { WhitePaperPdf } from "@/lib/reports/whitePaperPdf";
import path from "path";

const fontsDir = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "Poppins",
  fonts: [
    { src: path.join(fontsDir, "Poppins-Medium.ttf"), fontWeight: 500 },
    { src: path.join(fontsDir, "Poppins-SemiBold.ttf"), fontWeight: 600 },
  ],
});

Font.register({
  family: "Inter",
  fonts: [
    { src: path.join(fontsDir, "Inter-Regular.ttf"), fontWeight: 400 },
    { src: path.join(fontsDir, "Inter-Medium.ttf"), fontWeight: 500 },
  ],
});

/**
 * GET /api/reports/white-paper
 *
 * Generates and returns the Endeavrly white paper as a PDF. Content
 * mirrors the on-screen version at /about/white-paper, rendered in a
 * text-first, print-friendly layout. Public — no authentication.
 */
export async function GET() {
  try {
    const pdfBuffer = await renderToBuffer(<WhitePaperPdf />);

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="endeavrly-white-paper.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Error generating White Paper PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate white paper" },
      { status: 500 },
    );
  }
}
