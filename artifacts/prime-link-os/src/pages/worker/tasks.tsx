import { useState } from "react";
import { useListTasks, useUpdateTask, getListTasksQueryKey } from "@/lib/db";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Play, CheckSquare, Upload, X } from "lucide-react";

const priorityConfig: Record<string, { label: string; color: string; dot: string }> = {
  urgent: { label: "Urgent", color: "bg-red-500/10 text-red-400", dot: "bg-red-500" },
  high_value: { label: "High Value", color: "bg-orange-500/10 text-orange-400", dot: "bg-orange-500" },
  normal: { label: "Normal", color: "bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-500" },
  delayed: { label: "Delayed", color: "bg-gray-500/10 text-gray-400", dot: "bg-gray-600" },
};

const statusLabels: Record<string, string> = {
  pending: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  approved: "Approved",
};

export default function WorkerTasks() {
  const { user } = useAuth();
  const { data: allTasks } = useListTasks({});
  const updateTask = useUpdateTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");

  const myTasks = (allTasks ?? []).filter((t) => t.assignedTo === user?.id);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListTasksQueryKey({}) });

  const handleUpdate = (id: string) => {
    updateTask.mutate(
      { id, data: { progress, resultUrl: resultUrl || undefined } },
      { onSuccess: () => { setEditingId(null); invalidate(); toast({ title: "Progress updated" }); } }
    );
  };

  const handleStart = (id: string) => {
    updateTask.mutate(
      { id, data: { status: "in_progress", progress: 5 } },
      { onSuccess: () => { invalidate(); toast({ title: "Task started" }); } }
    );
  };

  const handleComplete = (id: string) => {
    updateTask.mutate(
      { id, data: { status: "completed", progress: 100 } },
      { onSuccess: () => { invalidate(); toast({ title: "Task completed!" }); } }
    );
  };

  const groups = [
    { label: "In Progress", tasks: myTasks.filter((t) => t.status === "in_progress") },
    { label: "Assigned", tasks: myTasks.filter((t) => t.status === "pending") },
    { label: "Completed", tasks: myTasks.filter((t) => t.status === "completed" || t.status === "approved") },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">My Tasks</h1>
        <p className="text-white/30 text-sm mt-1">{myTasks.length} total tasks</p>
      </div>

      {groups.map(
        (group) =>
          group.tasks.length > 0 && (
            <div key={group.label}>
              <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">
                {group.label} ({group.tasks.length})
              </h2>
              <div className="space-y-3">
                {group.tasks.map((task) => {
                  const p = priorityConfig[task.priority] ?? priorityConfig["normal"];
                  const isEditing = editingId === task.id;
                  return (
                    <div
                      key={task.id}
                      className="bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:bg-white/[0.05] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={`w-2 h-2 rounded-full ${p.dot}`} />
                            <p className="font-semibold text-white">{task.title}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.color}`}>
                              {p.label}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-xs text-white/30">{task.description}</p>
                          )}
                          {task.deadline && (
                            <p className="text-xs text-yellow-400/50 mt-1">
                              Due: {new Date(task.deadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {task.status === "pending" && (
                            <button
                              onClick={() => handleStart(task.id)}
                              className="flex items-center gap-1.5 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Play className="h-3 w-3" /> Start
                            </button>
                          )}
                          {task.status === "in_progress" && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(task.id);
                                  setProgress(task.progress ?? 0);
                                  setResultUrl(task.resultUrl ?? "");
                                }}
                                className="flex items-center gap-1.5 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <Upload className="h-3 w-3" /> Update
                              </button>
                              <button
                                onClick={() => handleComplete(task.id)}
                                className="flex items-center gap-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <CheckSquare className="h-3 w-3" /> Complete
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {task.progress != null && task.progress > 0 && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-white/30">{task.progress}%</span>
                        </div>
                      )}

                      {task.resultUrl && (
                        <p className="text-xs text-blue-400/60 mt-1">
                          Result:{" "}
                          <a
                            href={task.resultUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            {task.resultUrl}
                          </a>
                        </p>
                      )}

                      {isEditing && (
                        <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                          <div>
                            <label className="block text-xs text-white/40 mb-1">
                              Progress ({progress}%)
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={progress}
                              onChange={(e) => setProgress(parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          <input
                            value={resultUrl}
                            onChange={(e) => setResultUrl(e.target.value)}
                            placeholder="Result URL (optional)"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-blue-500/50 placeholder:text-white/20"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(task.id)}
                              className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg"
                            >
                              Save Progress
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-xs text-white/30 px-3 py-1.5 rounded-lg border border-white/10 hover:text-white"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )
      )}

      {myTasks.length === 0 && (
        <div className="text-center py-12 text-white/20 text-sm bg-white/[0.02] rounded-2xl border border-white/5">
          No tasks assigned. Your admin will assign tasks to you.
        </div>
      )}
    </div>
  );
}
