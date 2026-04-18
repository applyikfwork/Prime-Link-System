import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateClient, useListPlans, getListClientsQueryKey } from "@/lib/db";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Check } from "lucide-react";

export default function AddClientPage() {
  const [, setLocation] = useLocation();
  const { data: plans } = useListPlans();
  const createClient = useCreateClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ clientName: "", phone: "", business: "", website: "", planId: "", notes: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createClient.mutate(
      {
        data: {
          clientName: form.clientName,
          phone: form.phone,
          business: form.business,
          website: form.website,
          planId: form.planId || null,
          notes: form.notes,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListClientsQueryKey({}) });
          toast({ title: "Client added successfully!" });
          setLocation("/salesman");
        },
        onError: (err) =>
          toast({
            title: err instanceof Error ? err.message : "Failed to add client",
            variant: "destructive",
          }),
      }
    );
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Add New Client</h1>
        <p className="text-white/30 text-sm mt-1">Fill in the client's details to add them to the system</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Client Name *</label>
          <input
            value={form.clientName}
            onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
            required
            placeholder="e.g. TechFlow Solutions"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Phone Number *</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              required
              placeholder="+1-555-0100"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Business Type</label>
            <input
              value={form.business}
              onChange={(e) => setForm((f) => ({ ...f, business: e.target.value }))}
              placeholder="e.g. E-Commerce, SaaS"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Website URL</label>
            <input
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              placeholder="example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Plan Selected</label>
            <select
              value={form.planId}
              onChange={(e) => setForm((f) => ({ ...f, planId: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50"
            >
              <option value="">Choose a plan...</option>
              {(plans ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ${p.clientPrice}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Any important notes about this client..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20 resize-none"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={createClient.isPending}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            {createClient.isPending ? "Adding..." : "Add Client"}
          </button>
          <button
            type="button"
            onClick={() => setLocation("/salesman")}
            className="px-6 py-3 rounded-xl text-sm text-white/40 border border-white/10 hover:text-white hover:border-white/20 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
