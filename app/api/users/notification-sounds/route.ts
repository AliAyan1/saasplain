import { NextRequest, NextResponse } from "next/server";
import { getDbConnection } from "@/lib/db";
import { getAuthFromCookie } from "@/lib/auth";

async function hasNotifyColumns(conn: Awaited<ReturnType<typeof getDbConnection>>): Promise<boolean> {
  try {
    const [rows] = await conn.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'notify_sound_new_conversation'
       LIMIT 1`
    );
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}

const defaults = { newConversation: true, ongoingMessage: false };

export async function GET() {
  try {
    const auth = await getAuthFromCookie();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conn = await getDbConnection();
    try {
      if (!(await hasNotifyColumns(conn))) {
        await conn.end();
        return NextResponse.json(defaults);
      }
      const [rows] = await conn.execute(
        `SELECT notify_sound_new_conversation AS newConversation,
                notify_sound_ongoing_message AS ongoingMessage
         FROM users WHERE id = ?`,
        [auth.userId]
      );
      await conn.end();
      const r = (rows as { newConversation: number; ongoingMessage: number }[])[0];
      return NextResponse.json({
        newConversation: r ? Boolean(r.newConversation) : defaults.newConversation,
        ongoingMessage: r ? Boolean(r.ongoingMessage) : defaults.ongoingMessage,
      });
    } catch {
      await conn.end();
      return NextResponse.json(defaults);
    }
  } catch (err) {
    console.error("Notification sounds GET:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const newConversation =
      typeof body.newConversation === "boolean" ? body.newConversation : undefined;
    const ongoingMessage =
      typeof body.ongoingMessage === "boolean" ? body.ongoingMessage : undefined;

    const conn = await getDbConnection();
    if (!(await hasNotifyColumns(conn))) {
      await conn.end();
      return NextResponse.json(
        { error: "Run database migration: npm run db:migrate" },
        { status: 503 }
      );
    }

    const [current] = await conn.execute(
      `SELECT notify_sound_new_conversation AS newConversation,
              notify_sound_ongoing_message AS ongoingMessage
       FROM users WHERE id = ?`,
      [auth.userId]
    );
    const cur = (current as { newConversation: number; ongoingMessage: number }[])[0];
    const nextNew = newConversation ?? Boolean(cur?.newConversation ?? 1);
    const nextOngoing = ongoingMessage ?? Boolean(cur?.ongoingMessage ?? 0);

    await conn.execute(
      `UPDATE users SET notify_sound_new_conversation = ?, notify_sound_ongoing_message = ? WHERE id = ?`,
      [nextNew ? 1 : 0, nextOngoing ? 1 : 0, auth.userId]
    );
    await conn.end();

    return NextResponse.json({
      ok: true,
      newConversation: nextNew,
      ongoingMessage: nextOngoing,
    });
  } catch (err) {
    console.error("Notification sounds PATCH:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
