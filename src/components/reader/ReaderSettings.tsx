"use client";

import { Button } from "@/components/ui/button";
import { Settings2, Type, Moon, Sun, Coffee, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ReaderSettingsState {
  theme: "light" | "dark" | "sepia";
  fontSize: "sm" | "md" | "lg";
  zoom: number; // 90, 100, 110, 125
}

interface ReaderSettingsDropdownProps {
  settings: ReaderSettingsState;
  updateSettings: (newSettings: Partial<ReaderSettingsState>) => void;
}

export function ReaderSettingsDropdown({
  settings,
  updateSettings,
}: ReaderSettingsDropdownProps) {
  const handleZoomIn = () => {
    const zoomLevels = [90, 100, 110, 125];
    const currentIndex = zoomLevels.indexOf(settings.zoom);
    if (currentIndex < zoomLevels.length - 1) {
      updateSettings({ zoom: zoomLevels[currentIndex + 1] });
    }
  };

  const handleZoomOut = () => {
    const zoomLevels = [90, 100, 110, 125];
    const currentIndex = zoomLevels.indexOf(settings.zoom);
    if (currentIndex > 0) {
      updateSettings({ zoom: zoomLevels[currentIndex - 1] });
    }
  };

  const handleZoomReset = () => {
    updateSettings({ zoom: 100 });
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label="Reader display settings"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        }
      />
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-72 p-4 shadow-xl border border-border/70 bg-card rounded-xl"
      >
        <div className="space-y-5">
          <div className="border-b border-border/40 pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Display & Reading Preferences
            </h3>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground block">
              Reading Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Light */}
              <button
                type="button"
                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${
                  settings.theme === "light"
                    ? "border-amber-accent bg-amber-accent/10 shadow-xs"
                    : "border-border/60 hover:border-border"
                }`}
                onClick={() => updateSettings({ theme: "light" })}
                aria-label="Light theme"
              >
                <div className="h-6 w-full rounded bg-[#fdfdfc] border border-black/10 flex items-center justify-center">
                  <Sun className="h-3.5 w-3.5 text-zinc-800" />
                </div>
                <span className="text-[11px] font-medium text-foreground">
                  Light
                </span>
              </button>

              {/* Sepia */}
              <button
                type="button"
                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${
                  settings.theme === "sepia"
                    ? "border-amber-accent bg-amber-accent/10 shadow-xs"
                    : "border-border/60 hover:border-border"
                }`}
                onClick={() => updateSettings({ theme: "sepia" })}
                aria-label="Sepia warm theme"
              >
                <div className="h-6 w-full rounded bg-[#f5efe6] border border-[#d8c8b4] flex items-center justify-center">
                  <Coffee className="h-3.5 w-3.5 text-[#544130]" />
                </div>
                <span className="text-[11px] font-medium text-foreground">
                  Sepia
                </span>
              </button>

              {/* Dark */}
              <button
                type="button"
                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${
                  settings.theme === "dark"
                    ? "border-amber-accent bg-amber-accent/10 shadow-xs"
                    : "border-border/60 hover:border-border"
                }`}
                onClick={() => updateSettings({ theme: "dark" })}
                aria-label="Dark mode"
              >
                <div className="h-6 w-full rounded bg-[#121214] border border-white/10 flex items-center justify-center">
                  <Moon className="h-3.5 w-3.5 text-zinc-300" />
                </div>
                <span className="text-[11px] font-medium text-foreground">
                  Dark
                </span>
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5 text-muted-foreground" />
                Font Size
              </label>
              <span className="text-[11px] font-mono text-muted-foreground capitalize">
                {settings.fontSize === "sm"
                  ? "Small"
                  : settings.fontSize === "md"
                  ? "Medium"
                  : "Large"}
              </span>
            </div>
            <div className="flex bg-muted/60 p-1 rounded-lg border border-border/40">
              <button
                type="button"
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  settings.fontSize === "sm"
                    ? "bg-card shadow-xs text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => updateSettings({ fontSize: "sm" })}
              >
                Small
              </button>
              <button
                type="button"
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  settings.fontSize === "md"
                    ? "bg-card shadow-xs text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => updateSettings({ fontSize: "md" })}
              >
                Medium
              </button>
              <button
                type="button"
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  settings.fontSize === "lg"
                    ? "bg-card shadow-xs text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => updateSettings({ fontSize: "lg" })}
              >
                Large
              </button>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">
                Page Zoom
              </label>
              <span className="text-[11px] font-mono text-muted-foreground">
                {settings.zoom}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs border-border/60"
                onClick={handleZoomOut}
                disabled={settings.zoom <= 90}
                aria-label="Zoom out"
              >
                <ZoomOut className="h-3.5 w-3.5 mr-1" />
                Zoom Out
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs border-border/60"
                onClick={handleZoomReset}
                title="Reset zoom to 100%"
                aria-label="Reset zoom"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs border-border/60"
                onClick={handleZoomIn}
                disabled={settings.zoom >= 125}
                aria-label="Zoom in"
              >
                <ZoomIn className="h-3.5 w-3.5 mr-1" />
                Zoom In
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
