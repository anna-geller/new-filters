import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ShieldAlert } from "lucide-react";

import {
  getKillSwitchBanners,
  subscribeToKillSwitchBanners,
} from "@/lib/killSwitchBannerStore";
import {
  type KillSwitchBanner,
  getKillSwitchScopeLabel,
} from "@/types/killSwitch";

function normalize(value: string) {
  return value.toLowerCase();
}

function pathMatchesTarget(pathname: string, target: string): boolean {
  return normalize(pathname).includes(normalize(target));
}

function shouldDisplayBanner(banner: KillSwitchBanner, pathname: string): boolean {
  const path = normalize(pathname);

  if (banner.scope === "tenant") {
    return banner.targets.length === 0 || banner.targets.some((target) => target.trim().length > 0);
  }

  const hasMatchingTarget = banner.targets.length === 0
    ? true
    : banner.targets.some((target) => pathMatchesTarget(path, target));

  if (!hasMatchingTarget) {
    return false;
  }

  switch (banner.scope) {
    case "namespace":
      return path.includes("/namespaces") || path.includes("/flows") || path.includes("/executions");
    case "flow":
      return path.includes("/flows") || path.includes("/executions");
    case "execution":
      return path.includes("/executions");
    default:
      return true;
  }
}

function filterBannersForPath(banners: KillSwitchBanner[], pathname: string): KillSwitchBanner[] {
  if (!pathname) {
    return [];
  }
  return banners.filter((banner) => shouldDisplayBanner(banner, pathname));
}

export default function ActiveKillSwitchBanner() {
  const [location] = useLocation();
  const [internalBanners, setInternalBanners] = useState<KillSwitchBanner[]>(() =>
    filterBannersForPath(getKillSwitchBanners(), location ?? ""),
  );

  useEffect(() => {
    const unsubscribe = subscribeToKillSwitchBanners((next) => {
      setInternalBanners(filterBannersForPath(next, location ?? ""));
    });
    return unsubscribe;
  }, [location]);

  useEffect(() => {
    setInternalBanners(filterBannersForPath(getKillSwitchBanners(), location ?? ""));
  }, [location]);

  const banners = useMemo(() => internalBanners, [internalBanners]);

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-border bg-[#1F232D]">
      <div className="px-6 py-3 space-y-2">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="flex items-start gap-3 rounded-md border border-amber-500/60 bg-amber-600/10 px-4 py-3"
          >
            <ShieldAlert className="h-5 w-5 text-amber-300" />
            <div className="space-y-1 text-sm text-amber-100">
              <p className="font-medium text-amber-200">
                Kill switch active for {getKillSwitchScopeLabel(banner.scope).toLowerCase()} {banner.targets.join(", ") || "selection"}.
              </p>
              {banner.reason ? (
                <p className="text-amber-100/70">Reason: {banner.reason}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
