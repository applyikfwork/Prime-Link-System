import { useListEarnings } from "@/lib/db";
import { useAuth } from "@/hooks/use-auth";
import { DollarSign, Clock, CheckCircle, TrendingUp, Sparkles } from "lucide-react";

const typeColors: Record<string, string> = {
  commission: "bg-blue-500/10 text-blue-400",
  payment: "bg-indigo-500/10 text-indigo-400",
  bonus: "bg-yellow-500/10 text-yellow-400",
};

export default function SalesmanEarnings() {
  const { user } = useAuth();
  const { data: allEarnings } = useListEarnings({});
  const earnings = (allEarnings ?? []).filter((e) => e.userId === user?.id);

  const total = earnings.reduce((s, e) => s + e.amount, 0);
  const completed = earnings.filter((e) => e.status === "completed").reduce((s, e) => s + e.amount, 0);
  const pending = earnings.filter((e) => e.status === "pending").reduce((s, e) => s + e.amount, 0);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthly = earnings.filter((e) => new Date(e.createdAt) >= startOfMonth).reduce((s, e) => s + e.amount, 0);

  const newPending = earnings.filter((e) => e.status === "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">My Earnings</h1>
        <p className="text-white/30 text-sm mt-1">Your complete commission history</p>
      </div>

      {newPending.length > 0 && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 flex items-start gap-4">
          <Sparkles className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-yellow-300">₹{pending.toLocaleString("en-IN")} awaiting payment</p>
            <p className="text-xs text-yellow-400/60 mt-0.5">{newPending.length} commission{newPending.length > 1 ? "s" : ""} approved by admin, payment pending</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <DollarSign className="h-5 w-5 text-emerald-400 mb-3" />
          <div className="text-2xl font-black text-white">₹{total.toLocaleString("en-IN")}</div>
          <div className="text-xs text-white/30 mt-1">Total Earned</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <TrendingUp className="h-5 w-5 text-blue-400 mb-3" />
          <div className="text-2xl font-black text-white">₹{monthly.toLocaleString("en-IN")}</div>
          <div className="text-xs text-white/30 mt-1">This Month</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <CheckCircle className="h-5 w-5 text-emerald-400 mb-3" />
          <div className="text-2xl font-black text-white">₹{completed.toLocaleString("en-IN")}</div>
          <div className="text-xs text-white/30 mt-1">Paid Out</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <Clock className="h-5 w-5 text-yellow-400 mb-3" />
          <div className="text-2xl font-black text-white">₹{pending.toLocaleString("en-IN")}</div>
          <div className="text-xs text-white/30 mt-1">Pending</div>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-base font-bold text-white">Transaction History</h2>
        </div>
        <div className="divide-y divide-white/5">
          {earnings.map((e) => (
            <div key={e.id} className={`flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors ${e.status === "pending" ? "bg-yellow-500/[0.03]" : ""}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${e.status === "pending" ? "bg-yellow-500/10" : "bg-blue-500/10"}`}>
                {e.status === "pending" ? <Clock className="h-4 w-4 text-yellow-400" /> : <DollarSign className="h-4 w-4 text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{e.description ?? e.type}</p>
                <p className="text-xs text-white/30">{new Date(e.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${typeColors[e.type] ?? "bg-white/5 text-white/30"}`}>{e.type}</span>
              <div className="text-right shrink-0">
                <p className="font-bold text-white">₹{e.amount.toLocaleString("en-IN")}</p>
                <p className={`text-xs capitalize ${e.status === "completed" ? "text-emerald-400" : "text-yellow-400"}`}>{e.status}</p>
              </div>
            </div>
          ))}
          {earnings.length === 0 && (
            <p className="px-6 py-12 text-center text-white/20 text-sm">No earnings yet. Bring in clients to earn commissions!</p>
          )}
        </div>
      </div>
    </div>
  );
}
