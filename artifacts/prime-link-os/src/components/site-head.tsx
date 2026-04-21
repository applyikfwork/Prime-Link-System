import { useEffect } from "react";
import { useSiteSettings } from "@/lib/db";

function setFavicon(url: string | null) {
  const head = document.head;
  const existing = head.querySelectorAll('link[rel~="icon"]');
  existing.forEach((el) => el.parentElement?.removeChild(el));

  if (!url) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = "/favicon.svg";
    head.appendChild(link);
    return;
  }

  const link = document.createElement("link");
  link.rel = "icon";
  const lower = url.toLowerCase();
  if (lower.endsWith(".png")) link.type = "image/png";
  else if (lower.endsWith(".svg")) link.type = "image/svg+xml";
  else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) link.type = "image/jpeg";
  else if (lower.endsWith(".ico")) link.type = "image/x-icon";
  link.href = url;
  head.appendChild(link);
}

export function SiteHead() {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;
    document.title = settings.siteTitle || "Prime Link OS";
    setFavicon(settings.faviconUrl);
  }, [settings]);

  return null;
}
