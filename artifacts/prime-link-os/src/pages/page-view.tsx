import { Link, useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";
import { usePageBySlug, useListPages } from "@/lib/db";

export default function PageView() {
  const [, params] = useRoute("/pages/:slug");
  const slug = params?.slug ?? "";
  const { data: page, isLoading } = usePageBySlug(slug);
  const { data: pages } = useListPages({ visibleOnly: true });

  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      <header className="border-b border-white/5 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="text-lg font-black tracking-tight">
            <span className="text-white">PRIME LINK</span>
            <span className="text-blue-500"> OS</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-8 w-1/2 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
          </div>
        ) : !page || !page.isVisible ? (
          <div className="text-center py-20">
            <h1 className="text-3xl font-black mb-3">Page not found</h1>
            <p className="text-white/40 text-sm mb-6">The page you're looking for doesn't exist or is unavailable.</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              Go Home
            </Link>
          </div>
        ) : (
          <article>
            <h1 className="text-4xl font-black mb-4">{page.title}</h1>
            <p className="text-white/30 text-xs mb-8">
              Last updated {new Date(page.updatedAt ?? Date.now()).toLocaleDateString()}
            </p>
            <div className="prose prose-invert max-w-none whitespace-pre-wrap text-white/70 leading-relaxed">
              {page.content || <span className="text-white/30 italic">No content yet.</span>}
            </div>
          </article>
        )}
      </main>

      {pages && pages.length > 0 && (
        <footer className="border-t border-white/5 mt-12 py-8 px-6">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {pages.map((p) => (
                <Link key={p.id} href={`/pages/${p.slug}`} className="text-white/40 hover:text-white text-sm transition-colors">
                  {p.title}
                </Link>
              ))}
            </div>
            <p className="text-white/20 text-sm">© {new Date().getFullYear()} Prime Link. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
