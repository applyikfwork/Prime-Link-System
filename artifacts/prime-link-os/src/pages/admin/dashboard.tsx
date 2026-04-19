import { useEffect } from "react";
import { useGetDashboardStats, useGetRevenueAnalytics, useGetTopPerformers, useListUsers, useListClients, useListTasks, useListEarnings } from "@/lib/db";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DollarSign, Users, CheckSquare, TrendingUp, UserCheck, AlertTriangle, Building, Clock, IndianRupee, Sparkles } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color = "blue" }: { icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-emerald-500/10 text-emerald-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
    red: "bg-red-500/10 text-red-400",
    purple: "bg-purple-500/10 text-purple-400",
    indigo: "bg-indigo-500/10 text-indigo-400",
    orange: "bg-orange-500/10 text-orange-400",
  };
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] transition-colors">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${colorMap[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-black text-white mb-1">{value}</div>
      <div className="text-sm text-white/40 font-medium">{label}</div>
      {sub && <div className="text-xs text-white/20 mt-1">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const qc = useQueryClient();
  const { data: stats, isLoading } = useGetDashboardStats();
  const { data: revenue } = useGetRevenueAnalytics();
  const { data: performers } = useGetTopPerformers();
  const { data: users } = useListUsers();
  const { data: clients } = useListClients({});
  const { data: tasks } = useListTasks({});
  const { data: earnings } = useListEarnings({});

  useEffect(() => {
    const channel = supabase
      .channel("admin-dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => {
        qc.invalidateQueries({ queryKey: ["users"] });
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
        qc.invalidateQueries({ queryKey: ["tasks"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, () => {
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
        qc.invalidateQueries({ queryKey: ["clients"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "earnings" }, () => {
        qc.invalidateQueries({ queryKey: ["earnings"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  const totalRevenue = (earnings ?? []).filter((e) => e.type === "commission" && e.status === "completed").reduce((s, e) => s + e.amount, 0);
  const totalPayouts = (earnings ?? []).filter((e) => e.status === "completed").reduce((s, e) => s + e.amount, 0);
  const pendingPay = (earnings ?? []).filter((e) => e.status === "pending").reduce((s, e) => s + e.amount, 0);
  const profit = totalRevenue - totalPayouts;

  const completedClients = (clients ?? []).filter((c) => c.status === "completed").length;
  const activeClients = (clients ?? []).filter((c) => c.status === "active").length;
  const pendingTasks = (tasks ?? []).filter((t) => t.status === "pending").length;
  const inProgressTasks = (tasks ?? []).filter((t) => t.status === "in_progress").length;
  const completedTasks = (tasks ?? []).filter((t) => t.status === "completed").length;
  const approvedTasks = (tasks ?? []).filter((t) => t.status === "approved").length;
  const totalSalesmen = (users ?? []).filter((u) => u.role === "salesman").length;
  const totalWorkers = (users ?? []).filter((u) => u.role === "worker").length;
  const onlinePeople = (users ?? []).filter((u) => u.online && u.role !== "admin").length;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 rounded-lg w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Command Center</h1>
        <p className="text-white/30 text-sm mt-1">Real-time overview of all Prime Link operations</p>
      </div>

      {/* Revenue Stats */}
      <div>
        <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Revenue & Finance</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} color="green" sub="From completed commissions" />
          <StatCard icon={TrendingUp} label="Total Payouts" value={`₹${totalPayouts.toLocaleString("en-IN")}`} color="blue" sub="Paid to employees" />
          <StatCard icon={Clock} label="Pending Payments" value={`₹${pendingPay.toLocaleString("en-IN")}`} color="yellow" sub="Awaiting payout" />
          <StatCard icon={Sparkles} label="Net Profit" value={`₹${profit.toLocaleString("en-IN")}`} color="purple" sub="Revenue - Payouts" />
        </div>
      </div>

      {/* Client Stats */}
      <div>
        <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Client Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Building} label="Total Clients" value={(clients ?? []).length} color="blue" sub={`${stats?.newClientsThisMonth ?? 0} added this month`} />
          <StatCard icon={TrendingUp} label="Active Clients" value={activeClients} color="green" />
          <StatCard icon={CheckSquare} label="Completed Clients" value={completedClients} color="indigo" />
          <StatCard icon={AlertTriangle} label="Pending Clients" value={(clients ?? []).filter((c) => c.status === "pending").length} color="yellow" />
        </div>
      </div>

      {/* Task Stats */}
      <div>
        <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Task Tracking</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={AlertTriangle} label="Pending Tasks" value={pendingTasks} color="yellow" />
          <StatCard icon={TrendingUp} label="In Progress" value={inProgressTasks} color="blue" />
          <StatCard icon={CheckSquare} label="Awaiting Approval" value={completedTasks} color="orange" sub="Workers marked done" />
          <StatCard icon={UserCheck} label="Approved Tasks" value={approvedTasks} color="green" />
        </div>
      </div>

      {/* Team Stats */}
      <div>
        <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Team</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Employees" value={stats?.totalEmployees ?? 0} color="indigo" sub={`${onlinePeople} online now`} />
          <StatCard icon={DollarSign} label="Salesmen" value={totalSalesmen} color="blue" />
          <StatCard icon={UserCheck} label="Workers" value={totalWorkers} color="purple" />
          <StatCard icon={TrendingUp} label="Online Now" value={onlinePeople} color="green" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-6">Revenue vs Payouts (Last 6 Months)</h2>
          {revenue && revenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenue} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white" }} formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="salary" fill="#6366f1" radius={[4, 4, 0, 0]} name="Payouts" />
                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-white/20 text-sm">No revenue data yet</div>
          )}
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-4">Live Employee Status</h2>
          <div className="space-y-3">
            {(users ?? []).filter((u) => u.role !== "admin").slice(0, 8).map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${user.online ? "bg-emerald-400" : "bg-white/10"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 font-medium truncate">{user.name}</p>
                  <p className="text-xs text-white/30 capitalize">{user.role}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${user.online ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/20"}`}>
                  {user.online ? "Online" : "Offline"}
                </span>
              </div>
            ))}
            {(users?.filter((u) => u.role !== "admin").length ?? 0) === 0 && (
              <p className="text-white/20 text-sm">No employees yet</p>
            )}
          </div>
        </div>
      </div>

      {performers && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-4">Top Salesmen</h2>
            <div className="space-y-3">
              {performers.topSalesmen.length > 0 ? (
                performers.topSalesmen.map((p, i) => (
                  <div key={p.userId} className="flex items-center gap-3">
                    <span className="text-white/20 text-sm font-bold w-5">#{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm text-white/80 font-medium">{p.name}</p>
                      <p className="text-xs text-white/30">{p.count} clients</p>
                    </div>
                    <span className="text-sm font-bold text-blue-400">₹{p.totalEarnings.toLocaleString("en-IN")}</span>
                  </div>
                ))
              ) : (
                <p className="text-white/20 text-sm">No data yet</p>
              )}
            </div>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-4">Top Workers</h2>
            <div className="space-y-3">
              {performers.topWorkers.length > 0 ? (
                performers.topWorkers.map((p, i) => (
                  <div key={p.userId} className="flex items-center gap-3">
                    <span className="text-white/20 text-sm font-bold w-5">#{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm text-white/80 font-medium">{p.name}</p>
                      <p className="text-xs text-white/30">{p.count} tasks completed</p>
                    </div>
                    <span className="text-sm font-bold text-indigo-400">₹{p.totalEarnings.toLocaleString("en-IN")}</span>
                  </div>
                ))
              ) : (
                <p className="text-white/20 text-sm">No data yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {(earnings ?? []).filter((e) => e.status === "pending").length > 0 && (
        <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-yellow-400" />
            <h2 className="text-base font-bold text-yellow-300">Pending Payouts — Action Required</h2>
          </div>
          <div className="space-y-2">
            {(earnings ?? []).filter((e) => e.status === "pending").slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <span className="text-white/40 truncate max-w-sm">{e.description ?? e.type}</span>
                <span className="text-yellow-400 font-bold shrink-0 ml-4">₹{e.amount.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
