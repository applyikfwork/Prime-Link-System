import { useState } from "react";
import { useListTasks, useCreateTask, useUpdateTask, useListUsers, useListClients, useListPlans, useCreateEarning, getListTasksQueryKey, getListEarningsQueryKey } from "@/lib/db";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Check, CheckSquare, IndianRupee, Sparkles } from "lucide-react";

const priorityConfig: Record<string, { label: string; color: string; dot: string }> = {
  urgent: { label: "Urgent", color: "bg-red-500/10 text-red-400", dot: "bg-red-500" },
  high_value: { label: "High Value", color: "bg-orange-500/10 text-orange-400", dot: "bg-orange-500" },
  normal: { label: "Normal", color: "bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-500" },
  delayed: { label: "Delayed", color: "bg-gray-500/10 text-gray-400", dot: "bg-gray-600" },
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  in_progress: "bg-blue-500/10 text-blue-400",
  completed: "bg-emerald-500/10 text-emerald-400",
  approved: "bg-purple-500/10 text-purple-400",
};

export default function AdminTasks() {
  const { data: tasks, isLoading } = useListTasks({});
  const { data: users } = useListUsers();
  const { data: clients } = useListClients({});
  const { data: plans } = useListPlans();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const createEarning = useCreateEarning();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "normal",
    assignedTo: "",
    clientId: "",
    deadline: "",
  });

  const workers = (users ?? []).filter((u) => u.role === "worker");
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListEarningsQueryKey() });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createTask.mutate(
      {
        data: {
          title: form.title,
          description: form.description,
          priority: form.priority,
          assignedTo: form.assignedTo || null,
          clientId: form.clientId || null,
          deadline: form.deadline || null,
        },
      },
      {
        onSuccess: () => {
          setForm({ title: "", description: "", priority: "normal", assignedTo: "", clientId: "", deadline: "" });
          setShowForm(false);
          invalidate();
          toast({ title: "Task created and assigned to worker" });
        },
      }
    );
  };

  const handleApprove = async (taskId: string) => {
    setApprovingId(taskId);
    const task = (tasks ?? []).find((t) => t.id === taskId);
    if (!task) { setApprovingId(null); return; }

    const client = task.clientId ? (clients ?? []).find((c) => c.id === task.clientId) : null;
    const plan = client?.planId ? (plans ?? []).find((p) => p.id === client.planId) : null;

    const earningPromises: Promise<void>[] = [];
    let workerEarn = 0;
    let salesmanEarn = 0;

    if (task.assignedTo && plan?.workerPayment) {
      workerEarn = plan.workerPayment;
      earningPromises.push(
        createEarning.mutateAsync({
          userId: task.assignedTo,
          amount: workerEarn,
          type: "payment",
          description: `Payment for: ${task.title}${client ? ` (${client.clientName})` : ""}`,
          status: "pending",
        })
      );
    }

    if (client?.addedBy && plan?.salesmanCommission) {
      salesmanEarn = plan.salesmanCommission;
      earningPromises.push(
        createEarning.mutateAsync({
          userId: client.addedBy,
          amount: salesmanEarn,
          type: "commission",
          description: `Commission: ${client.clientName} — ${plan.name}`,
          status: "pending",
        })
      );
    }

    await Promise.allSettled(earningPromises);

    updateTask.mutate(
      { id: taskId, data: { status: "approved" } },
      {
        onSuccess: () => {
          invalidate();
          const parts: string[] = [];
          if (workerEarn > 0) parts.push(`Worker ₹${workerEarn.toLocaleString("en-IN")}`);
          if (salesmanEarn > 0) parts.push(`Salesman ₹${salesmanEarn.toLocaleString("en-IN")}`);
          toast({
            title: "✅ Task approved!",
            description: parts.length > 0
              ? `Earnings auto-created → ${parts.join(" · ")}`
              : "No plan linked — create earnings manually.",
          });
        },
        onSettled: () => setApprovingId(null),
      }
    );
  };

  const getUserName = (id: string | null | undefined) =>
    users?.find((u) => u.id === id)?.name ?? "Unassigned";
  const getClientName = (id: string | null | undefined) =>
    clients?.find((c) => c.id === id)?.clientName ?? "—";

  const byStatus = (status: string) => (tasks ?? []).filter((t) => t.status === status);
  const pending = byStatus("pending");
  const inProgress = byStatus("in_progress");
  const completed = byStatus("completed");
  const approved = byStatus("approved");

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const TaskCard = ({ task }: { task: NonNullable<typeof tasks>[0] }) => {
    const p = priorityConfig[task.priority] ?? priorityConfig["normal"];
    const isApproving = approvingId === task.id;
    const linkedClient = task.clientId ? (clients ?? []).find((c) => c.id === task.clientId) : null;
    const linkedPlan = linkedClient?.planId ? (plans ?? []).find((pl) => pl.id === linkedClient.planId) : null;

    return (
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:bg-white/[0.05] transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <div className={`w-2 h-2 rounded-full shrink-0 ${p.dot}`} />
              <p className="font-semibold text-white text-sm">{task.title}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.color}`}>{p.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[task.status] ?? "bg-white/5 text-white/30"}`}>
                {task.status.replace("_", " ")}
              </span>
            </div>
            {task.description && <p className="text-xs text-white/30 mb-2">{task.description}</p>}
            <div className="flex flex-wrap gap-4 text-xs text-white/30">
              <span>Client: <span className="text-white/50">{getClientName(task.clientId)}</span></span>
              <span>Worker: <span className="text-white/50">{getUserName(task.assignedTo)}</span></span>
              {linkedPlan && (
                <span>Plan: <span className="text-emerald-400/70">{linkedPlan.name}</span></span>
              )}
              {task.deadline && <span>Due: <span className="text-white/50">{new Date(task.deadline).toLocaleDateString()}</span></span>}
            </div>
            {linkedPlan && task.status === "completed" && (
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="text-white/20">On approval:</span>
                {task.assignedTo && <span className="text-violet-400">Worker ₹{linkedPlan.workerPayment.toLocaleString("en-IN")}</span>}
                {linkedClient?.addedBy && <span className="text-blue-400">Salesman ₹{linkedPlan.salesmanCommission.toLocaleString("en-IN")}</span>}
              </div>
            )}
            {task.progress != null && task.progress > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                </div>
                <span className="text-xs text-white/30">{task.progress}%</span>
              </div>
            )}
          </div>
          {task.status === "completed" && (
            <button
              onClick={() => handleApprove(task.id)}
              disabled={isApproving}
              className="flex items-center gap-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors shrink-0 disabled:opacity-60"
            >
              {isApproving ? (
                <><Sparkles className="h-3.5 w-3.5 animate-pulse" /> Approving...</>
              ) : (
                <><CheckSquare className="h-3.5 w-3.5" /> Approve & Pay</>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Task Control</h1>
          <p className="text-white/30 text-sm mt-1">{(tasks ?? []).length} total tasks</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="h-4 w-4" /> New Task
        </button>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl px-5 py-3 flex items-center gap-3 text-xs text-blue-300/70">
        <IndianRupee className="h-4 w-4 text-blue-400 shrink-0" />
        When you <strong className="text-blue-300">Approve & Pay</strong> a completed task, earnings are automatically created for the worker and the client's salesman based on the linked plan's commission rates.
      </div>

      {showForm && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Create Task</h2>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-white/40" /></button>
          </div>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Task Title" required className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20" />
              <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
                <option value="normal">Normal</option>
                <option value="high_value">High Value</option>
                <option value="urgent">Urgent</option>
                <option value="delayed">Delayed</option>
              </select>
              <select value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
                <option value="">Assign to Worker</option>
                {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              <select value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
                <option value="">Link to Client (required for auto-pay)</option>
                {(clients ?? []).map((c) => <option key={c.id} value={c.id}>{c.clientName}</option>)}
              </select>
              <input value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} type="date" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none" />
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Task description..." className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none placeholder:text-white/20 resize-none" rows={2} />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={createTask.isPending} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                <Check className="h-4 w-4" /> {createTask.isPending ? "Creating..." : "Create Task"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm text-white/40 border border-white/10 hover:text-white hover:border-white/20 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Awaiting Approval ({completed.length})</h2>
          </div>
          <div className="space-y-3">{completed.map((t) => <TaskCard key={t.id} task={t} />)}</div>
        </div>
      )}

      {inProgress.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-3">In Progress ({inProgress.length})</h2>
          <div className="space-y-3">{inProgress.map((t) => <TaskCard key={t.id} task={t} />)}</div>
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-3">Pending ({pending.length})</h2>
          <div className="space-y-3">{pending.map((t) => <TaskCard key={t.id} task={t} />)}</div>
        </div>
      )}

      {approved.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-3">Approved & Paid ({approved.length})</h2>
          <div className="space-y-3">{approved.map((t) => <TaskCard key={t.id} task={t} />)}</div>
        </div>
      )}

      {(tasks ?? []).length === 0 && (
        <div className="text-center py-12 text-white/20 text-sm bg-white/[0.02] rounded-2xl border border-white/5">
          No tasks yet. Create a task and assign it to a worker.
        </div>
      )}
    </div>
  );
}
