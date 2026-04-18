import { Router, type IRouter } from "express";
import { eq, and, gte, sql } from "drizzle-orm";
import { db, usersTable, clientsTable, tasksTable, earningsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/analytics/dashboard", async (_req, res): Promise<void> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalRevenueResult] = await db
    .select({ total: sql<number>`coalesce(sum(amount), 0)` })
    .from(earningsTable)
    .where(eq(earningsTable.type, "commission"));

  const [monthRevenueResult] = await db
    .select({ total: sql<number>`coalesce(sum(amount), 0)` })
    .from(earningsTable)
    .where(and(eq(earningsTable.type, "commission"), gte(earningsTable.createdAt, startOfMonth)));

  const [salaryOwedResult] = await db
    .select({ total: sql<number>`coalesce(sum(amount), 0)` })
    .from(earningsTable)
    .where(and(eq(earningsTable.status, "pending")));

  const allEmployees = await db.select().from(usersTable).where(eq(usersTable.role, "salesman"));
  const allWorkers = await db.select().from(usersTable).where(eq(usersTable.role, "worker"));
  const allUsers = [...allEmployees, ...allWorkers];

  const onlineUsers = allUsers.filter(u => u.online);

  const allTasks = await db.select().from(tasksTable);
  const ongoingTasks = allTasks.filter(t => t.status === "in_progress").length;
  const completedTasks = allTasks.filter(t => t.status === "completed").length;
  const pendingApprovals = allTasks.filter(t => t.status === "completed" && t.status !== "approved").length;

  const allClients = await db.select().from(clientsTable);
  const newClientsThisMonth = allClients.filter(c => c.createdAt >= startOfMonth).length;

  const totalRevenue = Number(totalRevenueResult?.total ?? 0);
  const revenueThisMonth = Number(monthRevenueResult?.total ?? 0);
  const totalSalaryOwed = Number(salaryOwedResult?.total ?? 0);

  res.json({
    totalRevenue,
    revenueThisMonth,
    totalEmployees: allUsers.length,
    onlineEmployees: onlineUsers.length,
    ongoingTasks,
    completedTasks,
    pendingApprovals,
    totalClients: allClients.length,
    newClientsThisMonth,
    totalSalaryOwed,
    profit: totalRevenue - totalSalaryOwed,
  });
});

router.get("/analytics/revenue", async (_req, res): Promise<void> => {
  const earnings = await db.select().from(earningsTable).orderBy(earningsTable.createdAt);

  const monthMap = new Map<string, { revenue: number; salary: number }>();

  for (const earning of earnings) {
    const date = new Date(earning.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthMap.has(key)) {
      monthMap.set(key, { revenue: 0, salary: 0 });
    }

    const entry = monthMap.get(key)!;
    if (earning.type === "commission") {
      entry.revenue += earning.amount;
    } else {
      entry.salary += earning.amount;
    }
  }

  const result = Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      revenue: data.revenue,
      salary: data.salary,
      profit: data.revenue - data.salary,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

  res.json(result);
});

router.get("/analytics/top-performers", async (_req, res): Promise<void> => {
  const salesmen = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.role, "salesman"));

  const workers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.role, "worker"));

  const allEarnings = await db.select().from(earningsTable);

  const topSalesmen = await Promise.all(
    salesmen.map(async (user) => {
      const userClients = await db
        .select()
        .from(clientsTable)
        .where(eq(clientsTable.addedBy, user.id));

      const userEarnings = allEarnings
        .filter(e => e.userId === user.id)
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        userId: user.id,
        name: user.name,
        count: userClients.length,
        totalEarnings: userEarnings,
      };
    })
  );

  const topWorkers = await Promise.all(
    workers.map(async (user) => {
      const userTasks = await db
        .select()
        .from(tasksTable)
        .where(and(eq(tasksTable.assignedTo, user.id), eq(tasksTable.status, "completed")));

      const userEarnings = allEarnings
        .filter(e => e.userId === user.id)
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        userId: user.id,
        name: user.name,
        count: userTasks.length,
        totalEarnings: userEarnings,
      };
    })
  );

  res.json({
    topSalesmen: topSalesmen.sort((a, b) => b.totalEarnings - a.totalEarnings).slice(0, 5),
    topWorkers: topWorkers.sort((a, b) => b.totalEarnings - a.totalEarnings).slice(0, 5),
  });
});

export default router;
