import { useEffect, useState } from "react";
import { useListAuditRequests, useUpdateAuditRequest, useDeleteAuditRequest, getListAuditRequestsQueryKey, type AuditRequest } from "@/lib/db";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Building, MessageSquare, Trash2, Inbox, Check, Archive, Clock } from "lucide-react";

const STATUS_STYLES: Record<AuditRequest["status"], { label: string; bg: string; text: string; ring: string }> = {
  new: { label: "New", bg: "bg-blue-500/15", text: "text-blue-300", ring: "ring-blue-500/30" },
  contacted: { label: "Contacted", bg: "bg-emerald-500/15", text: "text-emerald-300", ring: "ring-emerald-500/30" },
  archived: { label: "Archived", bg: "bg-white/5", text: "text-white/40", ring: "ring-white/10" },
};

export default function AdminAuditRequests() {
  const { data: requests, isLoading } = useListAuditRequests();
  const updateRequest = useUpdateAuditRequest();
  const deleteRequest = useDeleteAuditRequest();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | AuditRequest["status"]>("all");

  useEffect(() => {
    const ch = supabase
      .channel("audit-requests-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "audit_requests" }, () => {
        qc.invalidateQueries({ queryKey: getListAuditRequestsQueryKey() });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [qc]);

  const filtered = (requests ?? []).filter((r) => filter === "all" || r.status === filter);
  const newCount = (requests ?? []).filter((r) => r.status === "new").length;

  const handleStatus = (req: AuditRequest, status: AuditRequest["status"]) => {
    updateRequest.mutate({ id: req.id, data: { status } }, {
      onSuccess: () => toast({ title: `Marked as ${STATUS_STYLES[status].label}` }),
    });
  };

  const handleDelete = (req: AuditRequest) => {
    if (!confirm(`Delete request from ${req.name}?`)) return;
    deleteRequest.mutate({ id: req.id }, { onSuccess: () => toast({ title: "Request deleted" }) });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            Audit Requests
            {newCount > 0 && (
              <span className="text-xs font-bold bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full">
                {newCount} new
              </span>
            )}
          </h1>
          <p className="text-white/30 text-sm mt-1">
            Form submissions from the home page contact section
          </p>
        </div>
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
          {(["all", "new", "contacted", "archived"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === f ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
              }`}
            >
              {f === "all" ? "All" : STATUS_STYLES[f].label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30 text-sm bg-white/[0.02] rounded-2xl border border-white/5">
          <Inbox className="h-10 w-10 mx-auto text-white/15 mb-3" />
          <p>No requests {filter !== "all" ? `with status "${filter}"` : "yet"}.</p>
          <p className="text-xs text-white/20 mt-1">When someone fills the home page audit form, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const style = STATUS_STYLES[req.status];
            return (
              <div key={req.id} className={`bg-white/[0.03] border border-white/5 rounded-2xl p-5 ring-1 ${style.ring}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-bold text-white text-lg">{req.name}</h3>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                      <span className="text-xs text-white/30 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(req.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-3">
                      <a href={`mailto:${req.email}`} className="flex items-center gap-2 text-white/60 hover:text-blue-300 transition-colors">
                        <Mail className="h-4 w-4 text-white/30 shrink-0" />
                        <span className="truncate">{req.email}</span>
                      </a>
                      {req.phone && (
                        <a href={`tel:${req.phone}`} className="flex items-center gap-2 text-white/60 hover:text-blue-300 transition-colors">
                          <Phone className="h-4 w-4 text-white/30 shrink-0" />
                          <span>{req.phone}</span>
                        </a>
                      )}
                      {req.business && (
                        <div className="flex items-center gap-2 text-white/60">
                          <Building className="h-4 w-4 text-white/30 shrink-0" />
                          <span className="truncate">{req.business}</span>
                        </div>
                      )}
                    </div>

                    {req.message && (
                      <div className="flex gap-2 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white/70">
                        <MessageSquare className="h-4 w-4 text-white/30 shrink-0 mt-0.5" />
                        <p className="whitespace-pre-wrap leading-relaxed">{req.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {req.status !== "contacted" && (
                      <button
                        onClick={() => handleStatus(req, "contacted")}
                        className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" /> Mark Contacted
                      </button>
                    )}
                    {req.status !== "archived" && (
                      <button
                        onClick={() => handleStatus(req, "archived")}
                        className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/60 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Archive className="h-3.5 w-3.5" /> Archive
                      </button>
                    )}
                    {req.status === "archived" && (
                      <button
                        onClick={() => handleStatus(req, "new")}
                        className="flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Restore
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(req)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete request"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
