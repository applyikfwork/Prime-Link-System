import { useListTasks, useUpdateTask, useListEarnings, useListPlans, useListClients, getListTasksQueryKey } from "@/lib/db";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CheckSquare, Clock, Play, DollarSign, AlertTriangle, Wrench, Sparkles, Building2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const priorityConfig: Record<string, { dot: string; color: string; label: string }> = {
  urgent: { dot: "bg-red-500", color: "text-red-400", label: "Urgent" },
  high_value: { dot: "bg-orange-500", color: "text-orange-400", label: "High Value" },
  normal: { dot: "bg-emerald-500", color: "text-emerald-400", label: "Normal" },
  delayed: { dot: "bg-gray-600", color: "text-gray-400", label: "Delayed" },
};

const PLAN_COLORS = [
  { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
  { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
];

export default function WorkerDashboard() {
  const { user } = useAuth();
  const { data: allTasks } = useListTasks({});
  const { data: allClients } = useListClients({});
  const { data: earnings } = useListEarnings({});
  const { data: plans } = useListPlans();
  const updateTask = useUpdateTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const myTasks = (allTasks ?? []).filter((t) => t.assignedTo === user?.id);
  const myClients = (allClients ?? []).filter((c) => c.assignedTo === user?.id);
  const myEarnings = (earnings ?? []).filter((e) => e.userId === user?.id);

  const pending = myTasks.filter((t) => t.status === "pending");
  const inProgress = myTasks.filter((t) => t.status === "in_progress");
  const completed = myTasks.filter((t) => t.status === "completed" || t.status === "approved");

  const totalEarned = myEarnings.filter((e) => e.status === "completed").reduce((s, e) => s + e.amount, 0);
  const pendingPay = myEarnings.filter((e) => e.status === "pending").reduce((s, e) => s + e.amount, 0);
  const newEarnings = myEarnings.filter((e) => e.status === "pending");

  const sortedPlans = [...(plans ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const getPlanName = (id: string | null | undefined) => plans?.find((p) => p.id === id)?.name ?? "—";

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListTasksQueryKey({}) });

  const handleStart = (id: string) => {
    updateTask.mutate({ id, data: { status: "in_progress", progress: 10 } }, {
      onSuccess: () => { invalidate(); toast({ title: "Task started!" }); },
    });
  };

  const handleComplete = (id: string) => {
    updateTask.mutate({ id, data: { status: "completed", progress: 100 } }, {
      onSuccess: () => { invalidate(); toast({ title: "Task marked complete! Admin will review and approve." }); },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">My Work Dashboard</h1>
        <p className="text-white/30 text-sm mt-1">Your tasks and earnings</p>
      </div>

      {/* Earning highlight banner */}
      {newEarnings.length > 0 && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 flex items-start gap-4">
          <Sparkles className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <p className="text-sm font-bold text-yellow-300">
              ₹{pendingPay.toLocaleString("en-IN")} payment pending!
            </p>
            <p className="text-xs text-yellow-400/60 mt-0.5">
              {newEarnings.length} task{newEarnings.length > 1 ? "s" : ""} approved by admin — payment will be sent shortly
            </p>
          </div>
          <Link href="/worker/earnings" className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1 shrink-0">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mb-3" />
          <div className="text-2xl font-black text-white">{pending.length}</div>
          <div className="text-xs text-white/30 mt-1">Pending Tasks</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <Play className="h-5 w-5 text-blue-400 mb-3" />
          <div className="text-2xl font-black text-white">{inProgress.length}</div>
          <div className="text-xs text-white/30 mt-1">In Progress</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <CheckSquare className="h-5 w-5 text-emerald-400 mb-3" />
          <div className="text-2xl font-black text-white">{completed.length}</div>
          <div className="text-xs text-white/30 mt-1">Completed</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <DollarSign className="h-5 w-5 text-emerald-400 mb-3" />
          <div className="text-2xl font-black text-white">₹{totalEarned.toLocaleString("en-IN")}</div>
          <div className="text-xs text-white/30 mt-1">Total Earned</div>
        </div>
      </div>

      {/* Plan Pay Reference */}
      {sortedPlans.length > 0 && (
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Wrench className="h-4 w-4 text-violet-400" />
            <h2 className="text-base font-bold text-white">Your Payment Per Plan Completed</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {sortedPlans.map((plan, idx) => {
              const color = PLAN_COLORS[idx % PLAN_COLORS.length];
              return (
                <div key={plan.id} className={`rounded-xl border ${color.border} ${color.bg} p-4`}>
                  {plan.badge && <span className={`text-xs font-bold ${color.text} mb-2 block`}>⭐ {plan.badge}</span>}
                  <p className="text-sm font-bold text-white mb-2">{plan.name}</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/30">You earn</span>
                      <span className={`text-sm font-black ${color.text}`}>₹{plan.workerPayment.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assigned Clients */}
      {myClients.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-3">Clients Assigned to Me</h2>
          <div className="space-y-3">
            {myClients.map((client) => (
              <div key={client.id} className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex items-center gap-4">
                <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{client.clientName}</p>
                  <p className="text-xs text-white/30">{client.business ?? ""} · Plan: {getPlanName(client.planId)}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                  client.status === "active" ? "bg-blue-500/10 text-blue-400" :
                  client.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                  "bg-yellow-500/10 text-yellow-400"
                }`}>{client.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {inProgress.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest">In Progress</h2>
          </div>
          <div className="space-y-3">
            {inProgress.map((task) => {
              const p = priorityConfig[task.priority] ?? priorityConfig["normal"];
              return (
                <div key={task.id} className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${p.dot}`} />
                        <p className="font-semibold text-white">{task.title}</p>
                        <span className={`text-xs ${p.color}`}>{p.label}</span>
                      </div>
                      {task.description && <p className="text-xs text-white/30 mb-3">{task.description}</p>}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${task.progress ?? 0}%` }} />
                        </div>
                        <span className="text-xs text-white/40">{task.progress ?? 0}%</span>
                      </div>
                    </div>
                    <button onClick={() => handleComplete(task.id)} className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-lg transition-colors shrink-0">
                      Mark Done
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-3">Assigned to Me ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map((task) => {
              const p = priorityConfig[task.priority] ?? priorityConfig["normal"];
              return (
                <div key={task.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${p.dot}`} />
                        <p className="font-semibold text-white">{task.title}</p>
                        <span className={`text-xs ${p.color}`}>{p.label}</span>
                      </div>
                      {task.description && <p className="text-xs text-white/30">{task.description}</p>}
                      {task.deadline && <p className="text-xs text-yellow-400/60 mt-1">Due: {new Date(task.deadline).toLocaleDateString()}</p>}
                    </div>
                    <button onClick={() => handleStart(task.id)} className="flex items-center gap-1.5 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-2 rounded-lg transition-colors shrink-0">
                      <Play className="h-3 w-3" /> Start Work
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-white/20 uppercase tracking-widest mb-3">Done / Approved ({completed.length})</h2>
          <div className="space-y-2">
            {completed.slice(0, 3).map((task) => (
              <div key={task.id} className="bg-white/[0.02] border border-white/5 rounded-xl px-5 py-3 flex items-center gap-3">
                <CheckSquare className="h-4 w-4 text-emerald-400/50 shrink-0" />
                <p className="text-sm text-white/40 flex-1 truncate">{task.title}</p>
                <span className="text-xs text-emerald-400/60 capitalize">{task.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {myTasks.length === 0 && myClients.length === 0 && (
        <div className="text-center py-12 text-white/20 text-sm bg-white/[0.02] rounded-2xl border border-white/5">
          No tasks or clients assigned to you yet.
        </div>
      )}
    </div>
  );
}
