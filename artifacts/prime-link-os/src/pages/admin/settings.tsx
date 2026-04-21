import { useEffect, useRef, useState } from "react";
import { useSiteSettings, useUpdateSiteSettings } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Check, Globe, Image as ImageIcon, Loader2, Upload, Trash2 } from "lucide-react";

const BUCKET = "site-assets";
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

type AssetKind = "favicon" | "logo";

async function uploadAsset(kind: AssetKind, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const path = `${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function pathFromPublicUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export default function AdminSettings() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();
  const { toast } = useToast();

  const [siteTitle, setSiteTitle] = useState("");
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState<{ favicon: boolean; logo: boolean }>({ favicon: false, logo: false });

  const faviconInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setSiteTitle(settings.siteTitle ?? "");
      setFaviconUrl(settings.faviconUrl ?? null);
      setLogoUrl(settings.logoUrl ?? null);
    }
  }, [settings]);

  const handleFile = async (kind: AssetKind, file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast({ title: "File too large", description: "Max 2 MB", variant: "destructive" });
      return;
    }

    setUploading((u) => ({ ...u, [kind]: true }));
    try {
      const url = await uploadAsset(kind, file);
      const oldUrl = kind === "favicon" ? faviconUrl : logoUrl;
      const oldPath = pathFromPublicUrl(oldUrl);

      await new Promise<void>((resolve, reject) => {
        updateSettings.mutate(
          {
            data: kind === "favicon" ? { faviconUrl: url } : { logoUrl: url },
          },
          {
            onSuccess: () => resolve(),
            onError: (e) => reject(e),
          },
        );
      });

      if (kind === "favicon") setFaviconUrl(url);
      else setLogoUrl(url);

      if (oldPath) {
        await supabase.storage.from(BUCKET).remove([oldPath]).catch(() => undefined);
      }

      toast({ title: `${kind === "favicon" ? "Favicon" : "Logo"} uploaded` });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploading((u) => ({ ...u, [kind]: false }));
      if (kind === "favicon" && faviconInputRef.current) faviconInputRef.current.value = "";
      if (kind === "logo" && logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleRemove = async (kind: AssetKind) => {
    const url = kind === "favicon" ? faviconUrl : logoUrl;
    if (!url) return;
    if (!confirm(`Remove the current ${kind}?`)) return;
    const path = pathFromPublicUrl(url);
    updateSettings.mutate(
      { data: kind === "favicon" ? { faviconUrl: null } : { logoUrl: null } },
      {
        onSuccess: async () => {
          if (kind === "favicon") setFaviconUrl(null);
          else setLogoUrl(null);
          if (path) {
            await supabase.storage.from(BUCKET).remove([path]).catch(() => undefined);
          }
          toast({ title: `${kind === "favicon" ? "Favicon" : "Logo"} removed` });
        },
        onError: (err: Error) => toast({ title: "Remove failed", description: err.message, variant: "destructive" }),
      },
    );
  };

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(
      { data: { siteTitle: siteTitle.trim() || "Prime Link OS" } },
      {
        onSuccess: () => toast({ title: "Title saved" }),
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
          Upload your tab logo (favicon) and brand logo, and set the browser tab title
        </p>
      </div>

      {/* Title */}
      <form
        onSubmit={handleSaveTitle}
        className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4"
      >
        <label className="flex items-center gap-2 text-sm font-semibold text-white">
          <Globe className="h-4 w-4 text-blue-400" />
          Browser Tab Title
        </label>
        <div className="flex gap-3">
          <input
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            placeholder="Prime Link OS"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20"
          />
          <button
            type="submit"
            disabled={updateSettings.isPending}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Check className="h-4 w-4" /> Save
          </button>
        </div>
        <p className="text-xs text-white/30">Shows in the browser tab and bookmarks.</p>
      </form>

      {/* Favicon upload */}
      <AssetUploader
        kind="favicon"
        title="Favicon (Browser Tab Logo)"
        hint="Square image, ideally 64×64 or 128×128 pixels. PNG, SVG, or ICO. Max 2 MB."
        url={faviconUrl}
        uploading={uploading.favicon}
        inputRef={faviconInputRef}
        onSelect={(f) => handleFile("favicon", f)}
        onRemove={() => handleRemove("favicon")}
      />

      {/* Logo upload */}
      <AssetUploader
        kind="logo"
        title="Brand Logo"
        hint="Used for future branding placements. PNG or SVG recommended. Max 2 MB."
        url={logoUrl}
        uploading={uploading.logo}
        inputRef={logoInputRef}
        onSelect={(f) => handleFile("logo", f)}
        onRemove={() => handleRemove("logo")}
        large
      />
    </div>
  );
}

function AssetUploader({
  kind,
  title,
  hint,
  url,
  uploading,
  inputRef,
  onSelect,
  onRemove,
  large = false,
}: {
  kind: AssetKind;
  title: string;
  hint: string;
  url: string | null;
  uploading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSelect: (file: File | undefined) => void;
  onRemove: () => void;
  large?: boolean;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
      <label className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
        <ImageIcon className="h-4 w-4 text-blue-400" />
        {title}
      </label>

      <div className="flex items-start gap-5 flex-wrap">
        <div
          className={`${large ? "w-32 h-32" : "w-20 h-20"} rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0`}
        >
          {url ? (
            <img src={url} alt={`${kind} preview`} className="w-full h-full object-contain p-1" />
          ) : (
            <ImageIcon className={`${large ? "h-8 w-8" : "h-6 w-6"} text-white/20`} />
          )}
        </div>

        <div className="flex-1 min-w-[240px]">
          <input
            ref={inputRef}
            type="file"
            accept={kind === "favicon" ? "image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,image/jpeg" : "image/*"}
            onChange={(e) => onSelect(e.target.files?.[0])}
            className="hidden"
            id={`upload-${kind}`}
          />
          <div className="flex flex-wrap gap-2 mb-3">
            <label
              htmlFor={`upload-${kind}`}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                uploading
                  ? "bg-white/5 text-white/40 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> {url ? "Replace Image" : "Upload Image"}
                </>
              )}
            </label>
            {url && !uploading && (
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            )}
          </div>
          <p className="text-xs text-white/30">{hint}</p>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400/60 hover:text-blue-300 mt-2 inline-block break-all"
            >
              {url}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
