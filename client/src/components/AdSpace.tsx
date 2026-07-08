import { useEffect, useRef, useId } from "react";
import { cn } from "@/lib/utils";
import {
  ADSTERRA_BANNER_468x60,
  ADSTERRA_BANNER_160x300,
  ADSTERRA_NATIVE_BANNER,
} from "@/lib/adsterra";

export type AdFormat = "banner-468x60" | "banner-160x300" | "native";

interface AdSpaceProps {
  format: AdFormat;
  className?: string;
}

/**
 * Renders an Adsterra "atOptions" banner ad inside a sandboxed iframe.
 * Adsterra's invoke.js relies on document.write, which will wipe out the
 * React tree if run in the main document — an iframe with srcDoc isolates it.
 */
function AdBanner({ adKey, width, height }: { adKey: string; width: number; height: number }) {
  const srcDoc = `<!doctype html><html><head><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent;}</style></head><body>
<script>
  atOptions = {
    'key': '${adKey}',
    'format': 'iframe',
    'height': ${height},
    'width': ${width},
    'params': {}
  };
</script>
<script src="https://eliminatedfertilizer.com/${adKey}/invoke.js"></script>
</body></html>`;

  return (
    <iframe
      title="Advertisement"
      srcDoc={srcDoc}
      width={width}
      height={height}
      style={{ border: "none", display: "block" }}
      scrolling="no"
    />
  );
}

/** Renders the Adsterra Native Banner, which injects itself into a fixed container id. */
function AdNative() {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId().replace(/:/g, "");
  // Adsterra's native banner script is tied to one fixed container id from the
  // dashboard. Only one instance can safely exist in the DOM at a time — fine
  // here since this is a single-page app and only one route is mounted at once.
  const containerId = ADSTERRA_NATIVE_BANNER.containerId;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = "";

    const container = document.createElement("div");
    container.id = containerId;
    el.appendChild(container);

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = ADSTERRA_NATIVE_BANNER.scriptSrc;
    el.appendChild(script);

    return () => {
      el.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueId]);

  return <div ref={containerRef} className="w-full min-h-[100px]" />;
}

/**
 * AdSpace: styled ad placement using real Adsterra ad units.
 * Wrapped in a subtle themed card so it reads as intentional UI, not a broken box.
 */
export function AdSpace({ format, className = "" }: AdSpaceProps) {
  const content =
    format === "banner-468x60" ? (
      <AdBanner
        adKey={ADSTERRA_BANNER_468x60.key}
        width={ADSTERRA_BANNER_468x60.width}
        height={ADSTERRA_BANNER_468x60.height}
      />
    ) : format === "banner-160x300" ? (
      <AdBanner
        adKey={ADSTERRA_BANNER_160x300.key}
        width={ADSTERRA_BANNER_160x300.width}
        height={ADSTERRA_BANNER_160x300.height}
      />
    ) : (
      <AdNative />
    );

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg border border-border/60 bg-card/40 p-2 overflow-hidden",
        className
      )}
      data-ad-format={format}
    >
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50 self-start px-0.5">
        Sponsored
      </span>
      <div className="flex items-center justify-center w-full">{content}</div>
    </div>
  );
}

export default AdSpace;
