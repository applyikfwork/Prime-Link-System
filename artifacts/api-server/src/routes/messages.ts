import { Router, type IRouter } from "express";
import { eq, and, or } from "drizzle-orm";
import { db, messagesTable } from "@workspace/db";
import {
  CreateMessageBody,
  MarkMessageReadParams,
  ListMessagesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/messages", async (req, res): Promise<void> => {
  const params = ListMessagesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const session = req.session as Record<string, unknown>;
  const userId = session["userId"] as number | undefined;

  let query = db.select().from(messagesTable).$dynamic();
  const conditions = [];

  if (params.data.isGroup === true) {
    conditions.push(eq(messagesTable.isGroup, true));
  } else if (params.data.receiverId != null && userId) {
    conditions.push(
      and(
        eq(messagesTable.isGroup, false),
        or(
          and(eq(messagesTable.senderId, userId), eq(messagesTable.receiverId, params.data.receiverId)),
          and(eq(messagesTable.senderId, params.data.receiverId), eq(messagesTable.receiverId, userId))
        )
      )!
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const messages = await query.orderBy(messagesTable.createdAt);
  res.json(messages);
});

router.post("/messages", async (req, res): Promise<void> => {
  const session = req.session as Record<string, unknown>;
  const userId = session["userId"] as number | undefined;

  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = CreateMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [message] = await db
    .insert(messagesTable)
    .values({ ...parsed.data, senderId: userId })
    .returning();

  res.status(201).json(message);
});

router.patch("/messages/:id/read", async (req, res): Promise<void> => {
  const params = MarkMessageReadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [message] = await db
    .update(messagesTable)
    .set({ isRead: true })
    .where(eq(messagesTable.id, params.data.id))
    .returning();

  if (!message) {
    res.status(404).json({ error: "Message not found" });
    return;
  }

  res.json(message);
});

export default router;
