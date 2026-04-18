import { useListClients, useListEarnings, useListPlans } from "@/lib/db";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { UserSquare, DollarSign, TrendingUp, Plus, Building2, ArrowRight, Clock } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  active: "bg-blue-500/10 text-blue-400",
  completed: "bg-emerald-500/10 text-emerald-400",
};

export default function SalesmanDashboard() {
  const { user } = useAuth();
  const { data: allClients } = useListClients({});
  const { data: plans } = useListPlans();
  const { data: earnings } = useListEarnings({});

  const myClients = (allClients ?? []).filter((c) => c.addedBy === user?.id);
  const myEarnings = (earnings ?? []).filter((e) => e.userId === user?.id);
  const totalEarned = myEarnings
    .filter((e) => e.status === "completed")
    .reduce((s, e) => s + e.amount, 0);
  const pendingEarnings = myEarnings
    .filter((e) => e.status === "pending")
    .reduce((s, e) => s + e.amount, 0);

  const getPlanName = (id: string | null | undefined) =>
    plans?.find((p) => p.id === id)?.name ?? "—";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-white/30 text-sm mt-1">Your sales performance overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <UserSquare className="h-5 w-5 text-blue-400 mb-3" />
          <div className="text-2xl font-black text-white">{myClients.length}</div>
          <div className="text-xs text-white/30 mt-1">Total Clients</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <TrendingUp className="h-5 w-5 text-emerald-400 mb-3" />
          <div className="text-2xl font-black text-white">
            {myClients.filter((c) => c.status === "active").length}
          </div>
          <div className="text-xs text-white/30 mt-1">Active Clients</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <DollarSign className="h-5 w-5 text-emerald-400 mb-3" />
          <div className="text-2xl font-black text-white">${totalEarned.toFixed(0)}</div>
          <div className="text-xs text-white/30 mt-1">Total Earned</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <Clock className="h-5 w-5 text-yellow-400 mb-3" />
          <div className="text-2xl font-black text-white">${pendingEarnings.toFixed(0)}</div>
          <div className="text-xs text-white/30 mt-1">Pending Payout</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">My Clients</h2>
            <Link href="/salesman/add-client" className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
              <Plus className="h-3.5 w-3.5" /> Add New
            </Link>
          </div>
          <div className="space-y-3">
            {myClients.slice(0, 5).map((client) => (
              <div key={client.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{client.clientName}</p>
                  <p className="text-xs text-white/30">{getPlanName(client.planId)}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize shrink-0 ${statusColors[client.status] ?? "bg-white/5 text-white/30"}`}>
                  {client.status}
                </span>
              </div>
            ))}
            {myClients.length === 0 && (
              <p className="text-white/20 text-sm text-center py-6">No clients yet. Add your first client!</p>
            )}
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-4">Recent Earnings</h2>
          <div className="space-y-3">
            {myEarnings.slice(0, 6).map((e) => (
              <div key={e.id} className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/50 capitalize">{e.type}</p>
                  <p className="text-xs text-white/20">{new Date(e.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">${e.amount.toFixed(0)}</p>
                  <p className={`text-xs capitalize ${e.status === "completed" ? "text-emerald-400" : "text-yellow-400"}`}>
                    {e.status}
                  </p>
                </div>
              </div>
            ))}
            {myEarnings.length === 0 && (
              <p className="text-white/20 text-sm">No earnings yet</p>
            )}
          </div>
          <Link href="/salesman/earnings" className="flex items-center justify-center gap-1.5 mt-4 text-xs text-white/30 hover:text-white transition-colors">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
