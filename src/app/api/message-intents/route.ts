import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllIntents } from "@/lib/message-intents";

/**
 * GET /api/message-intents
 *
 * Returns the list of available message intents with their templates.
 * This is a LOCKED set of intents - users cannot send arbitrary messages.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const intents = getAllIntents();

    // Transform to a simpler format for the UI
    const intentList = intents.map((intent) => ({
      intent: intent.intent,
      label: intent.label,
      description: intent.description,
      template: intent.template,
      hasVariables: intent.variables.length > 0,
      variables: intent.variables.map((v) => ({
        name: v.name,
        label: v.label,
        type: v.type,
        required: v.required,
        maxLength: v.maxLength,
        placeholder: v.placeholder,
      })),
    }));

    return NextResponse.json({
      intents: intentList,
      count: intentList.length,
    }, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Failed to fetch message intents:", error);
    return NextResponse.json(
      { error: "Failed to fetch message intents" },
      { status: 500 }
    );
  }
}
