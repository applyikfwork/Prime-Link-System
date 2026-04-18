import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { LoginBody } from "@workspace/api-zod";
import { createHash } from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "prime_link_salt_2024").digest("hex");
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const passwordHash = hashPassword(password);

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!user || user.passwordHash !== passwordHash) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (user.status === "disabled") {
    res.status(401).json({ error: "Account disabled" });
    return;
  }

  await db
    .update(usersTable)
    .set({ online: true, lastActive: new Date() })
    .where(eq(usersTable.id, user.id));

  const session = req.session as Record<string, unknown>;
  session["userId"] = user.id;
  session["userRole"] = user.role;

  const { passwordHash: _ph, ...safeUser } = user;

  res.json({
    user: { ...safeUser, online: true },
    token: `session-${user.id}`,
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const session = req.session as Record<string, unknown>;
  const userId = session["userId"] as number | undefined;

  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const { passwordHash: _ph, ...safeUser } = user;
  res.json(safeUser);
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const session = req.session as Record<string, unknown>;
  const userId = session["userId"] as number | undefined;

  if (userId) {
    await db
      .update(usersTable)
      .set({ online: false, lastActive: new Date() })
      .where(eq(usersTable.id, userId));
  }

  req.session.destroy(() => {
    res.json({ success: true });
  });
});

export { hashPassword };
export default router;
