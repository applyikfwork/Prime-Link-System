import { useListEarnings, useListUsers, useUpdateEarning, getListEarningsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

const typeColors: Record<string, string> = {
  commission: "bg-blue-500/10 text-blue-400",
  payment: "bg-indigo-500/10 text-indigo-400",
  bonus: "bg-yellow-500/10 text-yellow-400",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  completed: "bg-emerald-500/10 text-emerald-400",
};

export default function AdminEarnings() {
  const { data: earnings } = useListEarnings({});
  const { data: users } = useListUsers();
  const updateEarning = useUpdateEarning();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListEarningsQueryKey({}) });

  const totalRevenue = (earnings ?? []).filter(e => e.type === "commission").reduce((s, e) => s + e.amount, 0);
  const totalSalary = (earnings ?? []).reduce((s, e) => s + e.amount, 0);
  const pending = (earnings ?? []).filter(e => e.status === "pending").reduce((s, e) => s + e.amount, 0);
  const profit = totalRevenue - totalSalary;

  const getUserName = (id: number) => users?.find(u => u.id === id)?.name ?? `User #${id}`;

  const handlePayout = (id: number) => {
    updateEarning.mutate({ id, data: { status: "completed" } }, {
      onSuccess: () => { invalidate(); toast({ title: "Marked as paid" }); },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Earnings Overview</h1>
        <p className="text-white/30 text-sm mt-1">Financial summary across all employees</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-3"><DollarSign className="h-4 w-4 text-emerald-400" /></div>
          <div className="text-2xl font-black text-white">${totalRevenue.toFixed(0)}</div>
          <div className="text-xs text-white/30 mt-1">Total Revenue</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3"><TrendingUp className="h-4 w-4 text-blue-400" /></div>
          <div className="text-2xl font-black text-white">${totalSalary.toFixed(0)}</div>
          <div className="text-xs text-white/30 mt-1">Total Payouts</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <div className="w-9 h-9 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-3"><Clock className="h-4 w-4 text-yellow-400" /></div>
          <div className="text-2xl font-black text-white">${pending.toFixed(0)}</div>
          <div className="text-xs text-white/30 mt-1">Pending Payments</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <div className="w-9 h-9 bg-purple-500/10 rounded-xl flex items-center justify-center mb-3"><CheckCircle className="h-4 w-4 text-purple-400" /></div>
          <div className="text-2xl font-black text-white">${profit.toFixed(0)}</div>
          <div className="text-xs text-white/30 mt-1">Net Profit</div>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-base font-bold text-white">All Transactions</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-widest">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-widest">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-widest">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-widest">Date</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-white/30 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(earnings ?? []).map(e => (
              <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-medium text-white">{getUserName(e.userId)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${typeColors[e.type] ?? "bg-white/5 text-white/30"}`}>{e.type}</span>
                </td>
                <td className="px-6 py-4 font-bold text-white">${e.amount.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[e.status] ?? "bg-white/5 text-white/30"}`}>{e.status}</span>
                </td>
                <td className="px-6 py-4 text-white/30 text-xs">{new Date(e.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  {e.status === "pending" && (
                    <button onClick={() => handlePayout(e.id)} className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors">
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {(earnings ?? []).length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-white/20 text-sm">No earnings recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
