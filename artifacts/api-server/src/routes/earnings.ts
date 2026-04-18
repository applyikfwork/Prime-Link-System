import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, earningsTable } from "@workspace/db";
import {
  CreateEarningBody,
  UpdateEarningBody,
  UpdateEarningParams,
  ListEarningsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/earnings", async (req, res): Promise<void> => {
  const params = ListEarningsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db.select().from(earningsTable).$dynamic();
  const conditions = [];

  if (params.data.userId != null) {
    conditions.push(eq(earningsTable.userId, params.data.userId));
  }
  if (params.data.status) {
    conditions.push(eq(earningsTable.status, params.data.status));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const earnings = await query.orderBy(earningsTable.createdAt);
  res.json(earnings);
});

router.post("/earnings", async (req, res): Promise<void> => {
  const parsed = CreateEarningBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [earning] = await db
    .insert(earningsTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(earning);
});

router.patch("/earnings/:id", async (req, res): Promise<void> => {
  const params = UpdateEarningParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateEarningBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [earning] = await db
    .update(earningsTable)
    .set(parsed.data)
    .where(eq(earningsTable.id, params.data.id))
    .returning();

  if (!earning) {
    res.status(404).json({ error: "Earning not found" });
    return;
  }

  res.json(earning);
});

export default router;
