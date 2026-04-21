import { useEffect, useState } from "react";
import { useSiteSettings, useUpdateSiteSettings } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { Check, Globe, Image as ImageIcon, Loader2 } from "lucide-react";

export default function AdminSettings() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();
  const { toast } = useToast();

  const [siteTitle, setSiteTitle] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (settings) {
      setSiteTitle(settings.siteTitle ?? "");
      setFaviconUrl(settings.faviconUrl ?? "");
      setLogoUrl(settings.logoUrl ?? "");
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(
      {
        data: {
          siteTitle: siteTitle.trim() || "Prime Link OS",
          faviconUrl: faviconUrl.trim() || null,
          logoUrl: logoUrl.trim() || null,
        },
      },
      {
        onSuccess: () => toast({ title: "Settings saved" }),
        onError: (err: Error) => toast({ title: "Save failed", description: err.message, variant: "destructive" }),
      },
    );
  };

  if (isLoading) {
    return <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">Site Settings</h1>
        <p className="text-white/30 text-sm mt-1">
          Control the browser tab title and the icon shown in Chrome and other browsers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
            <Globe className="h-4 w-4 text-blue-400" />
            Browser Tab Title
          </label>
          <input
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            placeholder="Prime Link OS"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20"
          />
          <p className="text-xs text-white/30 mt-1.5">
            Shows in the browser tab and bookmarks. Visitors see this in their tab.
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
            <ImageIcon className="h-4 w-4 text-blue-400" />
            Favicon URL (Tab Logo)
          </label>
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <input
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                placeholder="https://example.com/favicon.png"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20"
              />
              <p className="text-xs text-white/30 mt-1.5">
                Paste a public image URL. Best size: 32×32 or 64×64 pixels (PNG, SVG, or ICO).
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              {faviconUrl ? (
                <img src={faviconUrl} alt="favicon preview" className="w-full h-full object-contain" />
              ) : (
                <ImageIcon className="h-5 w-5 text-white/20" />
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
            <ImageIcon className="h-4 w-4 text-blue-400" />
            Logo URL (Optional)
          </label>
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20"
              />
              <p className="text-xs text-white/30 mt-1.5">
                Stored for future use (e.g. branding header). Doesn't change the existing PRIME LINK OS text logo.
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="logo preview" className="w-full h-full object-contain" />
              ) : (
                <ImageIcon className="h-5 w-5 text-white/20" />
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-white/5">
          <button
            type="submit"
            disabled={updateSettings.isPending}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {updateSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save Settings
          </button>
          <p className="text-xs text-white/30 self-center">Changes apply immediately to all visitors.</p>
        </div>
      </form>
    </div>
  );
}
