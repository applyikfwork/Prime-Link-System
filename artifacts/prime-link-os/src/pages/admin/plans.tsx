import { useState } from "react";
import { useListPlans, useCreatePlan, useUpdatePlan, useDeletePlan, getListPlansQueryKey, type Plan } from "@/lib/db";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, X, Check, Briefcase } from "lucide-react";

export default function AdminPlans() {
  const { data: plans, isLoading } = useListPlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", clientPrice: "", salesmanCommission: "", workerPayment: "", description: "" });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      clientPrice: parseFloat(form.clientPrice),
      salesmanCommission: parseFloat(form.salesmanCommission),
      workerPayment: parseFloat(form.workerPayment),
      description: form.description,
    };
    if (editId) {
      updatePlan.mutate({ id: editId, data }, {
        onSuccess: () => {
          setEditId(null); setShowForm(false);
          setForm({ name: "", clientPrice: "", salesmanCommission: "", workerPayment: "", description: "" });
          invalidate(); toast({ title: "Plan updated" });
        },
      });
    } else {
      createPlan.mutate({ data }, {
        onSuccess: () => {
          setShowForm(false);
          setForm({ name: "", clientPrice: "", salesmanCommission: "", workerPayment: "", description: "" });
          invalidate(); toast({ title: "Plan created" });
        },
      });
    }
  };

  const handleEdit = (plan: Plan) => {
    if (!plan) return;
    setForm({
      name: plan.name,
      clientPrice: String(plan.clientPrice),
      salesmanCommission: String(plan.salesmanCommission),
      workerPayment: String(plan.workerPayment),
      description: plan.description ?? "",
    });
    setEditId(plan.id);
    setShowForm(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete plan "${name}"?`)) return;
    deletePlan.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Plan deleted" }); } });
  };

  if (isLoading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Service Plans</h1>
          <p className="text-white/30 text-sm mt-1">{(plans ?? []).length} plans</p>
        </div>
        <button onClick={() => { setEditId(null); setForm({ name: "", clientPrice: "", salesmanCommission: "", workerPayment: "", description: "" }); setShowForm(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="h-4 w-4" /> New Plan
        </button>
      </div>

      {showForm && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">{editId ? "Edit Plan" : "New Plan"}</h2>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-white/40" /></button>
          </div>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Plan Name" required className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20" />
              <input value={form.clientPrice} onChange={e => setForm(f => ({ ...f, clientPrice: e.target.value }))} type="number" step="0.01" placeholder="Client Price ($)" required className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20" />
              <input value={form.salesmanCommission} onChange={e => setForm(f => ({ ...f, salesmanCommission: e.target.value }))} type="number" step="0.01" placeholder="Salesman Commission ($)" required className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20" />
              <input value={form.workerPayment} onChange={e => setForm(f => ({ ...f, workerPayment: e.target.value }))} type="number" step="0.01" placeholder="Worker Payment ($)" required className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20" />
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Plan description..." className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20 resize-none sm:col-span-2" rows={2} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                <Check className="h-4 w-4" /> {editId ? "Update" : "Create"} Plan
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm text-white/40 border border-white/10 hover:text-white hover:border-white/20">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(plans ?? []).map(plan => (
          <div key={plan.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.05] transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(plan)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleDelete(plan.id, plan.name)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <h3 className="font-bold text-white mb-1">{plan.name}</h3>
            {plan.description && <p className="text-white/30 text-xs mb-4">{plan.description}</p>}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/30">Client Price</span>
                <span className="font-bold text-emerald-400">${plan.clientPrice.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/30">Salesman Commission</span>
                <span className="font-semibold text-blue-400">${plan.salesmanCommission.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/30">Worker Payment</span>
                <span className="font-semibold text-indigo-400">${plan.workerPayment.toFixed(0)}</span>
              </div>
            </div>
          </div>
        ))}
        {(plans ?? []).length === 0 && (
          <div className="col-span-3 text-center py-12 text-white/20 text-sm">No plans yet. Create your first service plan.</div>
        )}
      </div>
    </div>
  );
}
