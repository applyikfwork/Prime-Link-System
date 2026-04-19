import { useState } from "react";
import { useListEarnings, useListUsers, useUpdateEarning, getListEarningsQueryKey } from "@/lib/db";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, Clock, CheckCircle, Plus, X, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ userId: "", amount: "", type: "commission", description: "" });
  const [saving, setSaving] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListEarningsQueryKey({}) });

  const totalRevenue = (earnings ?? [])
    .filter((e) => e.type === "commission" && e.status === "completed")
    .reduce((s, e) => s + e.amount, 0);
  const totalSalary = (earnings ?? [])
    .filter((e) => e.status === "completed")
    .reduce((s, e) => s + e.amount, 0);
  const pending = (earnings ?? [])
    .filter((e) => e.status === "pending")
    .reduce((s, e) => s + e.amount, 0);
  const profit = totalRevenue - totalSalary;

  const getUserName = (id: string) => users?.find((u) => u.id === id)?.name ?? `User #${id.slice(0, 6)}`;

  const handlePayout = (id: string) => {
    updateEarning.mutate(
      { id, data: { status: "completed" } },
      {
        onSuccess: () => {
          invalidate();
          toast({ title: "Marked as paid" });
        },
      }
    );
  };

  const handleAddEarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId || !form.amount) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("earnings").insert({
        user_id: form.userId,
        amount: parseFloat(form.amount),
        type: form.type,
        description: form.description || null,
        status: "pending",
      });
      if (error) throw error;
      setForm({ userId: "", amount: "", type: "commission", description: "" });
      setShowForm(false);
      invalidate();
      toast({ title: "Earning record added" });
    } catch {
      toast({ title: "Failed to add earning", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const employees = (users ?? []).filter((u) => u.role !== "admin");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Earnings Overview</h1>
          <p className="text-white/30 text-sm mt-1">Financial summary across all employees</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Earning
        </button>
      </div>

      {showForm && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Add Earning Record</h2>
            <button onClick={() => setShowForm(false)}>
              <X className="h-4 w-4 text-white/40" />
            </button>
          </div>
          <form onSubmit={handleAddEarning}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <select
                value={form.userId}
                onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                required
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
              >
                <option value="">Select Employee</option>
                {employees.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
              <input
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                type="number"
                step="0.01"
                min="0"
                placeholder="Amount (₹)"
                required
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none placeholder:text-white/20"
              />
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
              >
                <option value="commission">Commission (Salesman)</option>
                <option value="payment">Payment (Worker)</option>
                <option value="bonus">Bonus</option>
              </select>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description (optional)"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none placeholder:text-white/20"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold"
              >
                <Check className="h-4 w-4" /> {saving ? "Adding..." : "Add Record"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm text-white/40 border border-white/10 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-3">
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">₹{totalRevenue.toLocaleString("en-IN")}</div>
          <div className="text-xs text-white/30 mt-1">Total Revenue</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">₹{totalSalary.toLocaleString("en-IN")}</div>
          <div className="text-xs text-white/30 mt-1">Total Payouts</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <div className="w-9 h-9 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-3">
            <Clock className="h-4 w-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-white">₹{pending.toLocaleString("en-IN")}</div>
          <div className="text-xs text-white/30 mt-1">Pending Payments</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <div className="w-9 h-9 bg-purple-500/10 rounded-xl flex items-center justify-center mb-3">
            <CheckCircle className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">₹{profit.toLocaleString("en-IN")}</div>
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
            {(earnings ?? []).map((e) => (
              <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-medium text-white">{getUserName(e.userId)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${typeColors[e.type] ?? "bg-white/5 text-white/30"}`}>
                    {e.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-white">₹{e.amount.toLocaleString("en-IN")}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[e.status] ?? "bg-white/5 text-white/30"}`}>
                    {e.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-white/30 text-xs">
                  {new Date(e.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {e.status === "pending" && (
                    <button
                      onClick={() => handlePayout(e.id)}
                      className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {(earnings ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-white/20 text-sm">
                  No earnings recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
