import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "salesman" | "worker";
  status: "active" | "disabled";
  online: boolean;
  performanceScore: number | null;
  lastSeenAt: string | null;
  createdAt: string;
};

export type Client = {
  id: string;
  clientName: string;
  phone: string;
  business: string | null;
  website: string | null;
  planId: string | null;
  addedBy: string | null;
  assignedTo: string | null;
  status: "pending" | "active" | "completed";
  notes: string | null;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: "urgent" | "high_value" | "normal" | "delayed";
  assignedTo: string | null;
  clientId: string | null;
  deadline: string | null;
  status: "pending" | "in_progress" | "completed" | "approved";
  progress: number | null;
  resultUrl: string | null;
  createdAt: string;
};

export type Plan = {
  id: string;
  name: string;
  clientPrice: number;
  salesmanCommission: number;
  workerPayment: number;
  description: string | null;
  features: string[];
  badge: string | null;
  sortOrder: number;
  createdAt: string;
};

export type Page = {
  id: string;
  slug: string;
  title: string;
  content: string;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type SiteSettings = {
  siteTitle: string;
  faviconUrl: string | null;
  logoUrl: string | null;
  updatedAt: string;
};

export type AuditRequest = {
  id: string;
  name: string;
  email: string;
  business: string | null;
  phone: string | null;
  message: string | null;
  status: "new" | "contacted" | "archived";
  createdAt: string;
};

export type Earning = {
  id: string;
  userId: string;
  amount: number;
  type: "commission" | "payment" | "bonus";
  status: "pending" | "completed";
  description: string | null;
  createdAt: string;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string | null;
  content: string;
  isGroup: boolean;
  createdAt: string;
};

export type DashboardStats = {
  totalRevenue: number;
  revenueThisMonth: number;
  totalEmployees: number;
  onlineEmployees: number;
  totalClients: number;
  newClientsThisMonth: number;
  ongoingTasks: number;
  completedTasks: number;
  pendingApprovals: number;
  totalSalaryOwed: number;
  profit: number;
};

export type RevenueData = {
  month: string;
  revenue: number;
  salary: number;
  profit: number;
};

export type TopPerformers = {
  topSalesmen: { userId: string; name: string; count: number; totalEarnings: number }[];
  topWorkers: { userId: string; name: string; count: number; totalEarnings: number }[];
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getSession(): User | null {
  try {
    const stored = localStorage.getItem("prime_link_session");
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
}

// ─── Mappers ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(r: any): User {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    status: r.status,
    online: r.online ?? false,
    performanceScore: r.performance_score ?? null,
    lastSeenAt: r.last_seen_at ?? null,
    createdAt: r.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapClient(r: any): Client {
  return {
    id: r.id,
    clientName: r.client_name,
    phone: r.phone,
    business: r.business ?? null,
    website: r.website ?? null,
    planId: r.plan_id ?? null,
    addedBy: r.added_by ?? null,
    assignedTo: r.assigned_to ?? null,
    status: r.status,
    notes: r.notes ?? null,
    createdAt: r.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTask(r: any): Task {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? null,
    priority: r.priority,
    assignedTo: r.assigned_to ?? null,
    clientId: r.client_id ?? null,
    deadline: r.deadline ?? null,
    status: r.status,
    progress: r.progress ?? null,
    resultUrl: r.result_url ?? null,
    createdAt: r.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPlan(r: any): Plan {
  return {
    id: r.id,
    name: r.name,
    clientPrice: Number(r.client_price),
    salesmanCommission: Number(r.salesman_commission),
    workerPayment: Number(r.worker_payment),
    description: r.description ?? null,
    features: Array.isArray(r.features) ? r.features : [],
    badge: r.badge ?? null,
    sortOrder: Number(r.sort_order ?? 0),
    createdAt: r.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPage(r: any): Page {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    content: r.content ?? "",
    isVisible: !!r.is_visible,
    sortOrder: Number(r.sort_order ?? 0),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEarning(r: any): Earning {
  return {
    id: r.id,
    userId: r.user_id,
    amount: Number(r.amount),
    type: r.type,
    status: r.status,
    description: r.description ?? null,
    createdAt: r.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMessage(r: any): Message {
  return {
    id: r.id,
    senderId: r.sender_id,
    receiverId: r.receiver_id ?? null,
    content: r.content,
    isGroup: r.is_group,
    createdAt: r.created_at,
  };
}

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const getListUsersQueryKey = () => ["users"] as const;
export const getListClientsQueryKey = (_p?: object) => ["clients"] as const;
export const getListTasksQueryKey = (_p?: object) => ["tasks"] as const;
export const getListPlansQueryKey = () => ["plans"] as const;
export const getListPagesQueryKey = () => ["pages"] as const;
export const getPageBySlugQueryKey = (slug: string) => ["pages", slug] as const;
export const getSiteSettingsQueryKey = () => ["site-settings"] as const;
export const getListAuditRequestsQueryKey = () => ["audit-requests"] as const;
export const getListEarningsQueryKey = (_p?: object) => ["earnings"] as const;
export const getListMessagesQueryKey = (_p?: object) => ["messages"] as const;

// ─── Auth ──────────────────────────────────────────────────────────────────────

export function useLogin() {
  return useMutation({
    mutationFn: async ({ data }: { data: { email: string; password: string } }) => {
      const hash = await hashPassword(data.password);
      const { data: row, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", data.email.toLowerCase().trim())
        .eq("password_hash", hash)
        .single();

      if (error || !row) throw new Error("Invalid credentials");
      if (row.status === "disabled") throw new Error("Account is disabled. Contact your admin.");

      const user = mapUser(row);
      localStorage.setItem("prime_link_session", JSON.stringify(user));

      await supabase
        .from("users")
        .update({ online: true, last_seen_at: new Date().toISOString() })
        .eq("id", user.id);

      window.dispatchEvent(new Event("prime_link_auth_change"));
      return { user };
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const user = getSession();
      if (user) {
        try {
          await supabase.from("users").update({ online: false }).eq("id", user.id);
        } catch {}
      }
      localStorage.removeItem("prime_link_session");
      window.dispatchEvent(new Event("prime_link_auth_change"));
    },
  });
}

// ─── Users ─────────────────────────────────────────────────────────────────────

export function useListUsers() {
  return useQuery({
    queryKey: getListUsersQueryKey(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id,name,email,role,status,online,performance_score,last_seen_at,created_at")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapUser);
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: { name: string; email: string; password: string; role: string };
    }) => {
      const hash = await hashPassword(data.password);
      const { data: row, error } = await supabase
        .from("users")
        .insert({
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          password_hash: hash,
          role: data.role,
          status: "active",
          online: false,
        })
        .select()
        .single();
      if (error) throw error;
      return mapUser(row);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: getListUsersQueryKey() }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        status: string;
        role: string;
        performanceScore: number;
        password: string;
      }>;
    }) => {
      const updates: Record<string, unknown> = {};
      if (data.status !== undefined) updates.status = data.status;
      if (data.role !== undefined) updates.role = data.role;
      if (data.performanceScore !== undefined) updates.performance_score = data.performanceScore;
      if (data.password !== undefined) updates.password_hash = await hashPassword(data.password);
      const { error } = await supabase.from("users").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: getListUsersQueryKey() }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: getListUsersQueryKey() }),
  });
}

// ─── Clients ───────────────────────────────────────────────────────────────────

export function useListClients(_params?: object) {
  return useQuery({
    queryKey: getListClientsQueryKey(_params),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapClient);
    },
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: {
        clientName: string;
        phone: string;
        business?: string;
        website?: string;
        planId?: string | null;
        notes?: string;
      };
    }) => {
      const currentUser = getSession();
      const { data: row, error } = await supabase
        .from("clients")
        .insert({
          client_name: data.clientName.trim(),
          phone: data.phone.trim(),
          business: data.business?.trim() || null,
          website: data.website?.trim() || null,
          plan_id: data.planId || null,
          added_by: currentUser?.id || null,
          notes: data.notes?.trim() || null,
          status: "pending",
        })
        .select()
        .single();
      if (error) throw error;
      return mapClient(row);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: getListClientsQueryKey() }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{ status: string; assignedTo: string | null }>;
    }) => {
      const updates: Record<string, unknown> = {};
      if (data.status !== undefined) updates.status = data.status;
      if ("assignedTo" in data) updates.assigned_to = data.assignedTo;
      const { error } = await supabase.from("clients").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: getListClientsQueryKey() }),
  });
}

// ─── Tasks ─────────────────────────────────────────────────────────────────────

export function useListTasks(_params?: object) {
  return useQuery({
    queryKey: getListTasksQueryKey(_params),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapTask);
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: {
        title: string;
        description?: string;
        priority?: string;
        assignedTo?: string | null;
        clientId?: string | null;
        deadline?: string | null;
      };
    }) => {
      const { data: row, error } = await supabase
        .from("tasks")
        .insert({
          title: data.title.trim(),
          description: data.description?.trim() || null,
          priority: data.priority || "normal",
          assigned_to: data.assignedTo || null,
          client_id: data.clientId || null,
          deadline: data.deadline || null,
          status: "pending",
          progress: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return mapTask(row);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: getListTasksQueryKey() }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{ status: string; progress: number; resultUrl: string }>;
    }) => {
      const updates: Record<string, unknown> = {};
      if (data.status !== undefined) updates.status = data.status;
      if (data.progress !== undefined) updates.progress = data.progress;
      if (data.resultUrl !== undefined) updates.result_url = data.resultUrl;
      const { error } = await supabase.from("tasks").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: getListTasksQueryKey() }),
  });
}

// ─── Plans ─────────────────────────────────────────────────────────────────────

export function useListPlans() {
  return useQuery({
    queryKey: getListPlansQueryKey(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapPlan);
    },
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: {
        name: string;
        clientPrice: number;
        salesmanCommission: number;
        workerPayment: number;
        description?: string;
        features?: string[];
        badge?: string | null;
        sortOrder?: number;
      };
    }) => {
      const { data: row, error } = await supabase
        .from("plans")
        .insert({
          name: data.name.trim(),
          client_price: data.clientPrice,
          salesman_commission: data.salesmanCommission,
          worker_payment: data.workerPayment,
          description: data.description?.trim() || null,
          features: data.features ?? [],
          badge: data.badge ?? null,
          sort_order: data.sortOrder ?? 0,
        })
        .select()
        .single();
      if (error) throw error;
      return mapPlan(row);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: getListPlansQueryKey() }),
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        name: string;
        clientPrice: number;
        salesmanCommission: number;
        workerPayment: number;
        description: string;
        features: string[];
        badge: string | null;
        sortOrder: number;
      }>;
    }) => {
      const updates: Record<string, unknown> = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.clientPrice !== undefined) updates.client_price = data.clientPrice;
      if (data.salesmanCommission !== undefined) updates.salesman_commission = data.salesmanCommission;
      if (data.workerPayment !== undefined) updates.worker_payment = data.workerPayment;
      if (data.description !== undefined) updates.description = data.description;
      if (data.features !== undefined) updates.features = data.features;
      if ("badge" in data) updates.badge = data.badge;
      if (data.sortOrder !== undefined) updates.sort_order = data.sortOrder;
      const { error } = await supabase.from("plans").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: getListPlansQueryKey() }),
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase.from("plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: getListPlansQueryKey() }),
  });
}

// ─── Pages ─────────────────────────────────────────────────────────────────────

export function useListPages(opts: { visibleOnly?: boolean } = {}) {
  return useQuery({
    queryKey: opts.visibleOnly ? ["pages", "visible"] : getListPagesQueryKey(),
    queryFn: async () => {
      let query = supabase.from("pages").select("*").order("sort_order", { ascending: true });
      if (opts.visibleOnly) query = query.eq("is_visible", true);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(mapPage);
    },
  });
}

export function usePageBySlug(slug: string) {
  return useQuery({
    queryKey: getPageBySlugQueryKey(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data ? mapPage(data) : null;
    },
    enabled: !!slug,
  });
}

export function useCreatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: {
        slug: string;
        title: string;
        content?: string;
        isVisible?: boolean;
        sortOrder?: number;
      };
    }) => {
      const { data: row, error } = await supabase
        .from("pages")
        .insert({
          slug: data.slug.trim().toLowerCase(),
          title: data.title.trim(),
          content: data.content ?? "",
          is_visible: data.isVisible ?? true,
          sort_order: data.sortOrder ?? 0,
        })
        .select()
        .single();
      if (error) throw error;
      return mapPage(row);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListPagesQueryKey() });
      qc.invalidateQueries({ queryKey: ["pages", "visible"] });
    },
  });
}

export function useUpdatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        slug: string;
        title: string;
        content: string;
        isVisible: boolean;
        sortOrder: number;
      }>;
    }) => {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (data.slug !== undefined) updates.slug = data.slug.trim().toLowerCase();
      if (data.title !== undefined) updates.title = data.title;
      if (data.content !== undefined) updates.content = data.content;
      if (data.isVisible !== undefined) updates.is_visible = data.isVisible;
      if (data.sortOrder !== undefined) updates.sort_order = data.sortOrder;
      const { error } = await supabase.from("pages").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListPagesQueryKey() });
      qc.invalidateQueries({ queryKey: ["pages", "visible"] });
    },
  });
}

export function useDeletePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase.from("pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListPagesQueryKey() });
      qc.invalidateQueries({ queryKey: ["pages", "visible"] });
    },
  });
}

// ─── Earnings ──────────────────────────────────────────────────────────────────

export function useListEarnings(_params?: object) {
  return useQuery({
    queryKey: getListEarningsQueryKey(_params),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("earnings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapEarning);
    },
  });
}

export function useUpdateEarning() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { status?: string } }) => {
      const { error } = await supabase
        .from("earnings")
        .update({ status: data.status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: getListEarningsQueryKey() }),
  });
}

export function useCreateEarning() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      userId: string;
      amount: number;
      type: string;
      description?: string;
      status?: string;
    }) => {
      const { error } = await supabase.from("earnings").insert({
        user_id: data.userId,
        amount: data.amount,
        type: data.type,
        description: data.description ?? null,
        status: data.status ?? "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: getListEarningsQueryKey() }),
  });
}

// ─── Messages ──────────────────────────────────────────────────────────────────

export function useListMessages(
  params?: { isGroup?: boolean; receiverId?: string },
  options?: {
    query?: {
      enabled?: boolean;
      refetchInterval?: number;
      queryKey?: unknown[];
    };
  }
) {
  const currentUser = getSession();
  return useQuery({
    queryKey: options?.query?.queryKey ?? getListMessagesQueryKey(params),
    queryFn: async () => {
      if (params?.isGroup) {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("is_group", true)
          .order("created_at", { ascending: true })
          .limit(200);
        if (error) throw error;
        return (data ?? []).map(mapMessage);
      } else if (params?.receiverId && currentUser) {
        const uid = currentUser.id;
        const rid = params.receiverId;
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("is_group", false)
          .or(
            `and(sender_id.eq.${uid},receiver_id.eq.${rid}),and(sender_id.eq.${rid},receiver_id.eq.${uid})`
          )
          .order("created_at", { ascending: true })
          .limit(200);
        if (error) throw error;
        return (data ?? []).map(mapMessage);
      }
      return [] as Message[];
    },
    enabled: options?.query?.enabled !== false,
    refetchInterval: options?.query?.refetchInterval,
  });
}

export function useCreateMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: { content: string; isGroup: boolean; receiverId?: string | null };
    }) => {
      const currentUser = getSession();
      if (!currentUser) throw new Error("Not authenticated");

      const { data: row, error } = await supabase
        .from("messages")
        .insert({
          sender_id: currentUser.id,
          receiver_id: data.receiverId || null,
          content: data.content,
          is_group: data.isGroup,
        })
        .select()
        .single();
      if (error) throw error;
      return mapMessage(row);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: getListMessagesQueryKey() }),
  });
}

// ─── Analytics ─────────────────────────────────────────────────────────────────

export function useGetDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [
        { data: users },
        { data: clients },
        { data: tasks },
        { data: earnings },
      ] = await Promise.all([
        supabase.from("users").select("id,role,online,status"),
        supabase.from("clients").select("id,status,created_at"),
        supabase.from("tasks").select("id,status"),
        supabase.from("earnings").select("id,amount,type,status"),
      ]);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const employees = (users ?? []).filter((u) => u.role !== "admin");
      const allEarnings = earnings ?? [];

      const totalRevenue = allEarnings
        .filter((e) => e.type === "commission" && e.status === "completed")
        .reduce((s, e) => s + Number(e.amount), 0);
      const revenueThisMonth = totalRevenue;
      const totalSalaryOwed = allEarnings
        .filter((e) => e.status === "pending")
        .reduce((s, e) => s + Number(e.amount), 0);
      const totalPaid = allEarnings
        .filter((e) => e.status === "completed")
        .reduce((s, e) => s + Number(e.amount), 0);

      return {
        totalRevenue,
        revenueThisMonth,
        totalEmployees: employees.length,
        onlineEmployees: employees.filter((u) => u.online).length,
        totalClients: (clients ?? []).length,
        newClientsThisMonth: (clients ?? []).filter((c) => c.created_at >= startOfMonth).length,
        ongoingTasks: (tasks ?? []).filter(
          (t) => t.status === "pending" || t.status === "in_progress"
        ).length,
        completedTasks: (tasks ?? []).filter(
          (t) => t.status === "completed" || t.status === "approved"
        ).length,
        pendingApprovals: (tasks ?? []).filter((t) => t.status === "completed").length,
        totalSalaryOwed,
        profit: totalRevenue - totalPaid,
      } as DashboardStats;
    },
    refetchInterval: 30000,
  });
}

export function useGetRevenueAnalytics() {
  return useQuery({
    queryKey: ["revenue-analytics"],
    queryFn: async () => {
      const { data: earnings } = await supabase
        .from("earnings")
        .select("amount,type,status,created_at")
        .eq("status", "completed")
        .order("created_at", { ascending: true });

      const now = new Date();
      const monthMap = new Map<string, { revenue: number; salary: number }>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        monthMap.set(key, { revenue: 0, salary: 0 });
      }

      (earnings ?? []).forEach((e) => {
        const d = new Date(e.created_at);
        const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        if (monthMap.has(key)) {
          const entry = monthMap.get(key)!;
          if (e.type === "commission") entry.revenue += Number(e.amount);
          else entry.salary += Number(e.amount);
        }
      });

      return Array.from(monthMap.entries()).map(([month, { revenue, salary }]) => ({
        month,
        revenue,
        salary,
        profit: revenue - salary,
      })) as RevenueData[];
    },
  });
}

export function useGetTopPerformers() {
  return useQuery({
    queryKey: ["top-performers"],
    queryFn: async () => {
      const [{ data: users }, { data: clients }, { data: tasks }, { data: earnings }] =
        await Promise.all([
          supabase.from("users").select("id,name,role"),
          supabase.from("clients").select("id,added_by,status"),
          supabase.from("tasks").select("id,assigned_to,status"),
          supabase.from("earnings").select("user_id,amount,status,type"),
        ]);

      const salesmen = (users ?? []).filter((u) => u.role === "salesman");
      const workers = (users ?? []).filter((u) => u.role === "worker");

      const topSalesmen = salesmen
        .map((u) => ({
          userId: u.id,
          name: u.name,
          count: (clients ?? []).filter((c) => c.added_by === u.id).length,
          totalEarnings: (earnings ?? [])
            .filter((e) => e.user_id === u.id && e.status === "completed")
            .reduce((s, e) => s + Number(e.amount), 0),
        }))
        .sort((a, b) => b.totalEarnings - a.totalEarnings)
        .slice(0, 5);

      const topWorkers = workers
        .map((u) => ({
          userId: u.id,
          name: u.name,
          count: (tasks ?? []).filter(
            (t) =>
              t.assigned_to === u.id &&
              (t.status === "completed" || t.status === "approved")
          ).length,
          totalEarnings: (earnings ?? [])
            .filter((e) => e.user_id === u.id && e.status === "completed")
            .reduce((s, e) => s + Number(e.amount), 0),
        }))
        .sort((a, b) => b.totalEarnings - a.totalEarnings)
        .slice(0, 5);

      return { topSalesmen, topWorkers } as TopPerformers;
    },
  });
}

// ─── Site Settings ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSiteSettings(r: any): SiteSettings {
  return {
    siteTitle: r?.site_title ?? "Prime Link OS",
    faviconUrl: r?.favicon_url ?? null,
    logoUrl: r?.logo_url ?? null,
    updatedAt: r?.updated_at ?? new Date().toISOString(),
  };
}

export function useSiteSettings() {
  return useQuery({
    queryKey: getSiteSettingsQueryKey(),
    queryFn: async (): Promise<SiteSettings> => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return mapSiteSettings(data ?? {});
    },
    staleTime: 60_000,
  });
}

export function useUpdateSiteSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }: { data: Partial<{ siteTitle: string; faviconUrl: string | null; logoUrl: string | null }> }) => {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (data.siteTitle !== undefined) updates.site_title = data.siteTitle;
      if (data.faviconUrl !== undefined) updates.favicon_url = data.faviconUrl || null;
      if (data.logoUrl !== undefined) updates.logo_url = data.logoUrl || null;
      const { error } = await supabase
        .from("site_settings")
        .upsert({ id: 1, ...updates }, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: getSiteSettingsQueryKey() }),
  });
}

// ─── Audit Requests ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAuditRequest(r: any): AuditRequest {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    business: r.business ?? null,
    phone: r.phone ?? null,
    message: r.message ?? null,
    status: r.status,
    createdAt: r.created_at,
  };
}

export function useListAuditRequests() {
  return useQuery({
    queryKey: getListAuditRequestsQueryKey(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapAuditRequest);
    },
  });
}

export function useCreateAuditRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }: { data: { name: string; email: string; business?: string; phone?: string; message?: string } }) => {
      const { data: row, error } = await supabase
        .from("audit_requests")
        .insert({
          name: data.name.trim(),
          email: data.email.trim(),
          business: data.business?.trim() || null,
          phone: data.phone?.trim() || null,
          message: data.message?.trim() || null,
        })
        .select()
        .single();
      if (error) throw error;
      return mapAuditRequest(row);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: getListAuditRequestsQueryKey() }),
  });
}

export function useUpdateAuditRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ status: AuditRequest["status"] }> }) => {
      const updates: Record<string, unknown> = {};
      if (data.status !== undefined) updates.status = data.status;
      const { error } = await supabase.from("audit_requests").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: getListAuditRequestsQueryKey() }),
  });
}

export function useDeleteAuditRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase.from("audit_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: getListAuditRequestsQueryKey() }),
  });
}
