import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { FastFactsPdf } from "@/lib/reports/fastFactsPdf";
import path from "path";
import { Font } from "@react-pdf/renderer";

// Register fonts with absolute paths for server-side rendering
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
 * GET /api/reports/fast-facts
 *
 * Generates and returns the "Fast Facts: The World of Innovation" PDF.
 * Mobile-first, 2-page vertical format for quick reading.
 * This is a public endpoint - no authentication required.
 */
export async function GET() {
  try {
    // Generate PDF
    const pdfBuffer = await renderToBuffer(<FastFactsPdf />);

    // Return PDF response
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="sprout-fast-facts-innovation.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
        // Cache for 24 hours since this is static content
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Error generating Fast Facts PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
