import { useState } from "react";
import { useListPlans, useCreatePlan, useUpdatePlan, useDeletePlan, getListPlansQueryKey, type Plan } from "@/lib/db";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, X, Check, Briefcase, IndianRupee, User, Wrench, ChevronDown, ChevronUp } from "lucide-react";

const PLAN_COLORS = [
  { border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500" },
  { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-500" },
  { border: "border-violet-500/30", bg: "bg-violet-500/10", text: "text-violet-400", dot: "bg-violet-500" },
  { border: "border-red-500/30", bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-500" },
];

const emptyForm = { name: "", clientPrice: "", salesmanCommission: "", workerPayment: "", description: "", badge: "", sortOrder: "", features: [] as string[], featureInput: "" };

export default function AdminPlans() {
  const { data: plans, isLoading } = useListPlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: form.name, clientPrice: parseFloat(form.clientPrice), salesmanCommission: parseFloat(form.salesmanCommission), workerPayment: parseFloat(form.workerPayment), description: form.description, badge: form.badge || null, sortOrder: form.sortOrder ? parseInt(form.sortOrder) : 0, features: form.features };
    if (editId) {
      updatePlan.mutate({ id: editId, data }, { onSuccess: () => { setEditId(null); setShowForm(false); setForm(emptyForm); invalidate(); toast({ title: "Plan updated" }); } });
    } else {
      createPlan.mutate({ data }, { onSuccess: () => { setShowForm(false); setForm(emptyForm); invalidate(); toast({ title: "Plan created" }); } });
    }
  };

  const handleEdit = (plan: Plan) => {
    setForm({ name: plan.name, clientPrice: String(plan.clientPrice), salesmanCommission: String(plan.salesmanCommission), workerPayment: String(plan.workerPayment), description: plan.description ?? "", badge: plan.badge ?? "", sortOrder: String(plan.sortOrder), features: [...plan.features], featureInput: "" });
    setEditId(plan.id);
    setShowForm(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete plan "${name}"?`)) return;
    deletePlan.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Plan deleted" }); } });
  };

  const addFeature = () => {
    const val = form.featureInput.trim();
    if (!val) return;
    setForm(f => ({ ...f, features: [...f.features, val], featureInput: "" }));
  };

  const sorted = [...(plans ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  if (isLoading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Service Plans</h1>
          <p className="text-white/30 text-sm mt-1">{(plans ?? []).length} plans configured</p>
        </div>
        <button onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="h-4 w-4" /> New Plan
        </button>
      </div>

      {showForm && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white text-lg">{editId ? "Edit Plan" : "New Plan"}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); }}><X className="h-4 w-4 text-white/40" /></button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Plan Name (e.g. Starter Plan)" required className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20" />
              <input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder='Badge (e.g. "Most Popular") — optional' className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20" />
            </div>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20 resize-none" rows={2} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-white/20" />
                <input value={form.clientPrice} onChange={e => setForm(f => ({ ...f, clientPrice: e.target.value }))} type="number" step="1" placeholder="Client Price" required className="w-full bg-white/5 border border-emerald-500/20 rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder:text-white/20" />
                <span className="absolute right-3 top-3.5 text-xs text-emerald-400/60">Client</span>
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-white/20" />
                <input value={form.salesmanCommission} onChange={e => setForm(f => ({ ...f, salesmanCommission: e.target.value }))} type="number" step="1" placeholder="Salesman Earns" required className="w-full bg-white/5 border border-blue-500/20 rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20" />
                <span className="absolute right-3 top-3.5 text-xs text-blue-400/60">Salesman</span>
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-white/20" />
                <input value={form.workerPayment} onChange={e => setForm(f => ({ ...f, workerPayment: e.target.value }))} type="number" step="1" placeholder="Worker Earns" required className="w-full bg-white/5 border border-violet-500/20 rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder:text-white/20" />
                <span className="absolute right-3 top-3.5 text-xs text-violet-400/60">Worker</span>
              </div>
            </div>
            <input value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} type="number" placeholder="Display Order (1, 2, 3...)" className="w-full sm:w-48 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20" />
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2 font-semibold">Services Included</p>
              <div className="flex gap-2 mb-3">
                <input value={form.featureInput} onChange={e => setForm(f => ({ ...f, featureInput: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }} placeholder="Type a service and press Enter..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20" />
                <button type="button" onClick={addFeature} className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">Add</button>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {form.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2 group">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="text-sm text-white/70 flex-1">{feat}</span>
                    <button type="button" onClick={() => setForm(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }))} className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-white/30 transition-all"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                {form.features.length === 0 && <p className="text-white/20 text-xs py-2 px-3">No services added yet</p>}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={createPlan.isPending || updatePlan.isPending} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                <Check className="h-4 w-4" /> {editId ? "Update Plan" : "Create Plan"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 rounded-xl text-sm text-white/40 border border-white/10 hover:text-white hover:border-white/20 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sorted.map((plan, idx) => {
          const color = PLAN_COLORS[idx % PLAN_COLORS.length];
          const isExpanded = expandedId === plan.id;
          return (
            <div key={plan.id} className={`bg-white/[0.03] border ${color.border} rounded-2xl overflow-hidden`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${color.bg} rounded-xl flex items-center justify-center`}>
                      <Briefcase className={`h-5 w-5 ${color.text}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{plan.name}</h3>
                      {plan.badge && <span className={`text-xs font-semibold ${color.text} ${color.bg} px-2 py-0.5 rounded-full`}>⭐ {plan.badge}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(plan)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(plan.id, plan.name)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                {plan.description && <p className="text-white/30 text-xs mb-4 leading-relaxed">{plan.description}</p>}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                    <IndianRupee className="h-3.5 w-3.5 text-emerald-400 mx-auto mb-1" />
                    <div className="text-sm font-black text-emerald-400">₹{plan.clientPrice.toLocaleString("en-IN")}</div>
                    <div className="text-xs text-white/30 mt-0.5">Client Pays</div>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                    <User className="h-3.5 w-3.5 text-blue-400 mx-auto mb-1" />
                    <div className="text-sm font-black text-blue-400">₹{plan.salesmanCommission.toLocaleString("en-IN")}</div>
                    <div className="text-xs text-white/30 mt-0.5">Salesman</div>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                    <Wrench className="h-3.5 w-3.5 text-violet-400 mx-auto mb-1" />
                    <div className="text-sm font-black text-violet-400">₹{plan.workerPayment.toLocaleString("en-IN")}</div>
                    <div className="text-xs text-white/30 mt-0.5">Worker</div>
                  </div>
                </div>
                {plan.features.length > 0 && (
                  <button onClick={() => setExpandedId(isExpanded ? null : plan.id)} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    {plan.features.length} services included
                  </button>
                )}
              </div>
              {isExpanded && (
                <div className="border-t border-white/5 px-6 py-4 space-y-2">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${color.dot} mt-1.5 shrink-0`} />
                      <span className="text-xs text-white/50">{feat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {(plans ?? []).length === 0 && (
          <div className="col-span-2 text-center py-16 text-white/20 text-sm bg-white/[0.02] rounded-2xl border border-white/5">No plans yet. Create your first service plan.</div>
        )}
      </div>
    </div>
  );
}
