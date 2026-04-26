import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookie } from "@/lib/auth";
import { getDbConnection } from "@/lib/db";
import { checkRateLimit, LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * Load chat messages for a conversation.
 * - Dashboard (logged-in owner): same as before.
 * - Embedded widget (no cookie): allowed if `conversationId` belongs to `chatbotId`
 *   (UUID + public bot id — no PII; rate-limited).
 */
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  const rl = checkRateLimit(req, "convMessages", LIMITS.convMessages);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { ...corsHeaders, "Retry-After": String(rl.retryAfter) } }
    );
  }

  const conversationId = req.nextUrl.searchParams.get("conversationId")?.trim() ?? "";
  const chatbotId = req.nextUrl.searchParams.get("chatbotId")?.trim() ?? "";
  if (!conversationId || !chatbotId) {
    return NextResponse.json(
      { error: "conversationId and chatbotId are required" },
      { status: 400, headers: corsHeaders }
    );
  }

  const auth = await getAuthFromCookie();

  const conn = await getDbConnection();
  try {
    const [convCheck] = await conn.execute(
      `SELECT c.id, b.user_id AS ownerId
       FROM conversations c
       INNER JOIN chatbots b ON b.id = c.chatbot_id
       WHERE c.id = ? AND b.id = ?`,
      [conversationId, chatbotId]
    );
    const rowsCheck = convCheck as { id: string; ownerId: string }[];
    if (rowsCheck.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
    }

    const ownerId = rowsCheck[0].ownerId;
    if (auth?.userId && auth.userId !== ownerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: corsHeaders });
    }
    // No auth: public widget read — conversation is already bound to this chatbot
    if (!auth?.userId) {
      // ok
    }

    const [rows] = await conn.execute(
      `SELECT cm.id, cm.role, cm.content
       FROM chat_messages cm
       WHERE cm.conversation_id = ?
       ORDER BY cm.created_at ASC`,
      [conversationId]
    );
    const list = (rows as { id: string; role: string; content: string }[]).map((r) => ({
      id: r.id,
      role: r.role === "user" || r.role === "assistant" ? r.role : "assistant",
      content: typeof r.content === "string" ? r.content : "",
    }));
    return NextResponse.json({ messages: list }, { headers: corsHeaders });
  } finally {
    await conn.end();
  }
}
