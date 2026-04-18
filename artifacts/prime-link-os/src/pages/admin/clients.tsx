import { useListClients, useUpdateClient, useListUsers, useListPlans, getListClientsQueryKey } from "@/lib/db";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Building2, Phone, Globe } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  active: "bg-blue-500/10 text-blue-400",
  completed: "bg-emerald-500/10 text-emerald-400",
};

export default function AdminClients() {
  const { data: clients, isLoading } = useListClients({});
  const { data: users } = useListUsers();
  const { data: plans } = useListPlans();
  const updateClient = useUpdateClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const workers = (users ?? []).filter((u) => u.role === "worker");

  const handleAssign = (clientId: string, workerId: string) => {
    updateClient.mutate(
      { id: clientId, data: { assignedTo: workerId || null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
          toast({ title: "Worker assigned" });
        },
      }
    );
  };

  const handleStatusChange = (clientId: string, status: string) => {
    updateClient.mutate(
      { id: clientId, data: { status } },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() }),
      }
    );
  };

  const getUserName = (id: string | null | undefined) =>
    users?.find((u) => u.id === id)?.name ?? "—";
  const getPlanName = (id: string | null | undefined) =>
    plans?.find((p) => p.id === id)?.name ?? "—";

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">All Clients</h1>
        <p className="text-white/30 text-sm mt-1">{(clients ?? []).length} total clients</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {(clients ?? []).map((client) => (
          <div
            key={client.id}
            className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.05] transition-colors"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{client.clientName}</p>
                    {client.business && (
                      <p className="text-xs text-white/30">{client.business}</p>
                    )}
                  </div>
                  <span
                    className={`ml-2 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[client.status] ?? "bg-white/5 text-white/30"}`}
                  >
                    {client.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-white/40">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {client.phone}
                  </span>
                  {client.website && (
                    <span className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      {client.website}
                    </span>
                  )}
                  <span>
                    Plan: <span className="text-white/60">{getPlanName(client.planId)}</span>
                  </span>
                  <span>
                    Added by:{" "}
                    <span className="text-white/60">{getUserName(client.addedBy)}</span>
                  </span>
                  {client.assignedTo && (
                    <span>
                      Assigned:{" "}
                      <span className="text-white/60">{getUserName(client.assignedTo)}</span>
                    </span>
                  )}
                </div>
                {client.notes && (
                  <p className="text-xs text-white/20 mt-2 italic">{client.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <select
                  value={client.assignedTo ?? ""}
                  onChange={(e) => handleAssign(client.id, e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                >
                  <option value="">Assign Worker</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                <select
                  value={client.status}
                  onChange={(e) => handleStatusChange(client.id, e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        {(clients ?? []).length === 0 && (
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-12 text-center">
            <Building2 className="h-8 w-8 text-white/10 mx-auto mb-3" />
            <p className="text-white/20 text-sm">
              No clients yet. Salesmen add clients through their portal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
