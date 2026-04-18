import { useEffect } from "react";
import { useGetDashboardStats, useGetRevenueAnalytics, useGetTopPerformers, useListUsers } from "@/lib/db";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DollarSign, Users, CheckSquare, TrendingUp, UserCheck, AlertTriangle, Building } from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "blue",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-emerald-500/10 text-emerald-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
    red: "bg-red-500/10 text-red-400",
    purple: "bg-purple-500/10 text-purple-400",
    indigo: "bg-indigo-500/10 text-indigo-400",
  };
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.05] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
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

  useEffect(() => {
    const channel = supabase
      .channel("admin-dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => {
        qc.invalidateQueries({ queryKey: ["users"] });
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, () => {
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 rounded-lg w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Command Center</h1>
        <p className="text-white/30 text-sm mt-1">Real-time overview of Prime Link operations</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${(stats?.totalRevenue ?? 0).toFixed(0)}`} color="green" />
        <StatCard icon={TrendingUp} label="Revenue This Month" value={`$${(stats?.revenueThisMonth ?? 0).toFixed(0)}`} color="blue" />
        <StatCard icon={Users} label="Total Employees" value={stats?.totalEmployees ?? 0} sub={`${stats?.onlineEmployees ?? 0} online now`} color="indigo" />
        <StatCard icon={Building} label="Total Clients" value={stats?.totalClients ?? 0} sub={`${stats?.newClientsThisMonth ?? 0} new this month`} color="purple" />
        <StatCard icon={CheckSquare} label="Tasks Ongoing" value={stats?.ongoingTasks ?? 0} color="yellow" />
        <StatCard icon={UserCheck} label="Tasks Completed" value={stats?.completedTasks ?? 0} color="green" />
        <StatCard icon={AlertTriangle} label="Pending Approvals" value={stats?.pendingApprovals ?? 0} color="red" />
        <StatCard icon={DollarSign} label="Salary Owed" value={`$${(stats?.totalSalaryOwed ?? 0).toFixed(0)}`} sub={`Profit: $${(stats?.profit ?? 0).toFixed(0)}`} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-6">Revenue vs Salary (Last 6 Months)</h2>
          {revenue && revenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenue} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="salary" fill="#6366f1" radius={[4, 4, 0, 0]} name="Salary" />
                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-white/20 text-sm">
              No revenue data yet
            </div>
          )}
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-4">Live Employee Status</h2>
          <div className="space-y-3">
            {(users ?? [])
              .filter((u) => u.role !== "admin")
              .slice(0, 8)
              .map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      user.online ? "bg-emerald-400" : "bg-white/10"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 font-medium truncate">{user.name}</p>
                    <p className="text-xs text-white/30 capitalize">{user.role}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      user.online
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-white/5 text-white/20"
                    }`}
                  >
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
                    <span className="text-sm font-bold text-blue-400">
                      ${p.totalEarnings.toFixed(0)}
                    </span>
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
                    <span className="text-sm font-bold text-indigo-400">
                      ${p.totalEarnings.toFixed(0)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-white/20 text-sm">No data yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
