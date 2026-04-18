import { useState } from "react";
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, X, Check, UserCircle } from "lucide-react";

const roleColors: Record<string, string> = {
  admin: "bg-yellow-500/10 text-yellow-400",
  salesman: "bg-blue-500/10 text-blue-400",
  worker: "bg-indigo-500/10 text-indigo-400",
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400",
  disabled: "bg-red-500/10 text-red-400",
};

export default function AdminEmployees() {
  const { data: users, isLoading } = useListUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "salesman" });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(
      { data: form },
      {
        onSuccess: () => {
          setForm({ name: "", email: "", password: "", role: "salesman" });
          setShowForm(false);
          invalidate();
          toast({ title: "Employee created" });
        },
        onError: () => toast({ title: "Failed to create employee", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Remove ${name}?`)) return;
    deleteUser.mutate({ id }, {
      onSuccess: () => { invalidate(); toast({ title: "Employee removed" }); },
      onError: () => toast({ title: "Failed to remove employee", variant: "destructive" }),
    });
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    updateUser.mutate({ id, data: { status: newStatus } }, {
      onSuccess: () => { invalidate(); toast({ title: `Employee ${newStatus}` }); },
    });
  };

  const nonAdminUsers = (users ?? []).filter(u => u.role !== "admin");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Employees</h1>
          <p className="text-white/30 text-sm mt-1">{nonAdminUsers.length} team members</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      {showForm && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">New Employee</h2>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-white/40 hover:text-white" /></button>
          </div>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name" required className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20" />
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="Email Address" required className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20" />
              <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} type="password" placeholder="Password" required className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20" />
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50">
                <option value="salesman">Salesman</option>
                <option value="worker">Worker (SEO Expert)</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={createUser.isPending} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                <Check className="h-4 w-4" /> {createUser.isPending ? "Creating..." : "Create Employee"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm text-white/40 hover:text-white border border-white/10 hover:border-white/20 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/30 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/30 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/30 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/30 uppercase tracking-widest">Performance</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-white/30 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {nonAdminUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <UserCircle className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-white/30 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${roleColors[user.role] ?? "bg-white/5 text-white/40"}`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[user.status] ?? "bg-white/5 text-white/30"}`}>{user.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    {user.performanceScore != null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${user.performanceScore}%` }} />
                        </div>
                        <span className="text-xs text-white/40">{user.performanceScore}%</span>
                      </div>
                    ) : <span className="text-white/20 text-xs">—</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleToggleStatus(user.id, user.status)} className="text-xs px-3 py-1 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-colors">
                        {user.status === "active" ? "Disable" : "Enable"}
                      </button>
                      <button onClick={() => handleDelete(user.id, user.name)} className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {nonAdminUsers.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-white/20 text-sm">No employees yet. Add your first team member.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
