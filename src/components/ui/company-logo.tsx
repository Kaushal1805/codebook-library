const brandStyles: Record<string, { mark: string; className: string }> = {
  Google: { mark: "G", className: "bg-white text-[#4285f4] ring-1 ring-white/80" },
  Microsoft: { mark: "▦", className: "bg-[#f25022] text-white" },
  Amazon: { mark: "a", className: "bg-[#131921] text-[#ff9900]" },
  Meta: { mark: "∞", className: "bg-[#0668e1] text-white" },
  Uber: { mark: "U", className: "bg-white text-black" },
  Flipkart: { mark: "F", className: "bg-[#2874f0] text-[#ffe500]" },
  Adobe: { mark: "A", className: "bg-[#ed1c24] text-white" },
  "Goldman Sachs": { mark: "GS", className: "bg-[#7399c6] text-white" },
  TCS: { mark: "T", className: "bg-[#2d2a6d] text-white" },
  Infosys: { mark: "i", className: "bg-[#007cc3] text-white" },
  Accenture: { mark: ">", className: "bg-[#a100ff] text-white" },
};

export function CompanyLogo({ name, compact = false }: { name: string; compact?: boolean }) {
  const brand = brandStyles[name] ?? { mark: name.slice(0, 1), className: "bg-muted text-foreground" };

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-md font-bold leading-none shadow-sm ${
        compact ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-sm"
      } ${brand.className}`}
    >
      {brand.mark}
    </span>
  );
}
