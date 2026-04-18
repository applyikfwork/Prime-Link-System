import { useListTasks, useUpdateTask, useListEarnings, getListTasksQueryKey } from "@/lib/db";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CheckSquare, Clock, Play, DollarSign, AlertTriangle } from "lucide-react";

const priorityConfig: Record<string, { dot: string; color: string }> = {
  urgent: { dot: "bg-red-500", color: "text-red-400" },
  high_value: { dot: "bg-orange-500", color: "text-orange-400" },
  normal: { dot: "bg-emerald-500", color: "text-emerald-400" },
  delayed: { dot: "bg-gray-600", color: "text-gray-400" },
};

export default function WorkerDashboard() {
  const { user } = useAuth();
  const { data: allTasks } = useListTasks({});
  const { data: earnings } = useListEarnings({});
  const updateTask = useUpdateTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const myTasks = (allTasks ?? []).filter((t) => t.assignedTo === user?.id);
  const myEarnings = (earnings ?? []).filter((e) => e.userId === user?.id);

  const pending = myTasks.filter((t) => t.status === "pending");
  const inProgress = myTasks.filter((t) => t.status === "in_progress");
  const completed = myTasks.filter((t) => t.status === "completed" || t.status === "approved");

  const totalEarned = myEarnings
    .filter((e) => e.status === "completed")
    .reduce((s, e) => s + e.amount, 0);
  const pendingPay = myEarnings
    .filter((e) => e.status === "pending")
    .reduce((s, e) => s + e.amount, 0);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListTasksQueryKey({}) });

  const handleStart = (id: string) => {
    updateTask.mutate(
      { id, data: { status: "in_progress", progress: 10 } },
      { onSuccess: () => { invalidate(); toast({ title: "Task started!" }); } }
    );
  };

  const handleComplete = (id: string) => {
    updateTask.mutate(
      { id, data: { status: "completed", progress: 100 } },
      { onSuccess: () => { invalidate(); toast({ title: "Task marked as complete!" }); } }
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">My Work Dashboard</h1>
        <p className="text-white/30 text-sm mt-1">Your tasks and earnings overview</p>
      </div>

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
          <div className="text-2xl font-black text-white">${totalEarned.toFixed(0)}</div>
          <div className="text-xs text-white/30 mt-1">Earned (${pendingPay.toFixed(0)} pending)</div>
        </div>
      </div>

      {inProgress.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-3">In Progress</h2>
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
                      </div>
                      {task.description && (
                        <p className="text-xs text-white/30 mb-3">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${task.progress ?? 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/40">{task.progress ?? 0}%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleComplete(task.id)}
                      className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-lg transition-colors shrink-0"
                    >
                      Mark Complete
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
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-3">Assigned to Me</h2>
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
                      </div>
                      {task.description && (
                        <p className="text-xs text-white/30">{task.description}</p>
                      )}
                      {task.deadline && (
                        <p className="text-xs text-yellow-400/60 mt-1">
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleStart(task.id)}
                      className="flex items-center gap-1.5 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-2 rounded-lg transition-colors shrink-0"
                    >
                      <Play className="h-3 w-3" /> Start
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {myTasks.length === 0 && (
        <div className="text-center py-12 text-white/20 text-sm bg-white/[0.02] rounded-2xl border border-white/5">
          No tasks assigned to you yet.
        </div>
      )}
    </div>
  );
}
