import { useState } from "react";
import {
  useListPages,
  useCreatePage,
  useUpdatePage,
  useDeletePage,
  type Page,
} from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, X, Check, Eye, EyeOff, FileText, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { Link } from "wouter";

const emptyForm = { slug: "", title: "", content: "", isVisible: true, sortOrder: "" };

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminPages() {
  const { data: pages, isLoading } = useListPages();
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const deletePage = useDeletePage();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      slug: slugify(form.slug || form.title),
      title: form.title.trim(),
      content: form.content,
      isVisible: form.isVisible,
      sortOrder: form.sortOrder ? parseInt(form.sortOrder) : 0,
    };
    if (!data.slug || !data.title) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (editId) {
      updatePage.mutate(
        { id: editId, data },
        {
          onSuccess: () => {
            setEditId(null);
            setShowForm(false);
            setForm(emptyForm);
            toast({ title: "Page updated" });
          },
          onError: (err: Error) => toast({ title: "Update failed", description: err.message, variant: "destructive" }),
        },
      );
    } else {
      createPage.mutate(
        { data },
        {
          onSuccess: () => {
            setShowForm(false);
            setForm(emptyForm);
            toast({ title: "Page created" });
          },
          onError: (err: Error) => toast({ title: "Create failed", description: err.message, variant: "destructive" }),
        },
      );
    }
  };

  const handleEdit = (page: Page) => {
    setForm({
      slug: page.slug,
      title: page.title,
      content: page.content,
      isVisible: page.isVisible,
      sortOrder: String(page.sortOrder),
    });
    setEditId(page.id);
    setShowForm(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete page "${title}"?`)) return;
    deletePage.mutate({ id }, { onSuccess: () => toast({ title: "Page deleted" }) });
  };

  const handleToggleVisible = (page: Page) => {
    updatePage.mutate({ id: page.id, data: { isVisible: !page.isVisible } });
  };

  const handleMoveOrder = (page: Page, dir: "up" | "down") => {
    const sorted = [...(pages ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((p) => p.id === page.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swap = sorted[swapIdx];
    const a = page.sortOrder;
    const b = swap.sortOrder;
    updatePage.mutate({ id: page.id, data: { sortOrder: b } }, {
      onSuccess: () => updatePage.mutate({ id: swap.id, data: { sortOrder: a } }),
    });
  };

  const sorted = [...(pages ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Footer Pages</h1>
          <p className="text-white/30 text-sm mt-1">
            {(pages ?? []).length} pages · Manage Terms, Privacy, and other footer pages
          </p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="h-4 w-4" /> New Page
        </button>
      </div>

      {showForm && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white text-lg">{editId ? "Edit Page" : "New Page"}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); }}>
              <X className="h-4 w-4 text-white/40" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))}
                  placeholder="Terms & Conditions"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">URL Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                  placeholder="terms-and-conditions"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20 font-mono"
                />
                <p className="text-xs text-white/20 mt-1">Will appear as /pages/{form.slug || "your-slug"}</p>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Write the page content here. Plain text or simple markdown."
                rows={10}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20 resize-y font-mono"
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isVisible}
                  onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-white/70">Visible in footer</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="text-xs text-white/40">Sort order:</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                  placeholder="0"
                  className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createPage.isPending || updatePage.isPending}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <Check className="h-4 w-4" /> {editId ? "Update Page" : "Create Page"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditId(null); }}
                className="px-4 py-2 rounded-xl text-sm text-white/40 border border-white/10 hover:text-white hover:border-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((page, idx) => (
          <div
            key={page.id}
            className={`bg-white/[0.03] border rounded-2xl p-5 ${page.isVisible ? "border-white/10" : "border-white/5 opacity-60"}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${page.isVisible ? "bg-blue-500/15 text-blue-400" : "bg-white/5 text-white/30"}`}>
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-white truncate">{page.title}</h3>
                  {!page.isVisible && (
                    <span className="text-[10px] uppercase tracking-wider text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/30 mt-0.5 font-mono truncate">/pages/{page.slug}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleMoveOrder(page, "up")}
                  disabled={idx === 0}
                  title="Move up"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleMoveOrder(page, "down")}
                  disabled={idx === sorted.length - 1}
                  title="Move down"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleToggleVisible(page)}
                  title={page.isVisible ? "Hide from footer" : "Show in footer"}
                  className={`p-1.5 rounded-lg transition-colors ${page.isVisible ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400" : "bg-white/5 hover:bg-white/10 text-white/40"}`}
                >
                  {page.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
                <Link
                  href={`/pages/${page.slug}`}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  title="View page"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => handleEdit(page)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(page.id, page.title)}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <div className="text-center py-16 text-white/20 text-sm bg-white/[0.02] rounded-2xl border border-white/5">
            No pages yet. Create pages like "Terms & Conditions" or "Privacy Policy" to show in the footer.
          </div>
        )}
      </div>
    </div>
  );
}
