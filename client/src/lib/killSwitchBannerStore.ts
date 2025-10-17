import type { KillSwitchBanner } from "@/types/killSwitch";

const STORAGE_KEY = "kestra-active-kill-switches";

type Listener = (banners: KillSwitchBanner[]) => void;

let currentBanners: KillSwitchBanner[] = [];

if (typeof window !== "undefined") {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      currentBanners = JSON.parse(stored) as KillSwitchBanner[];
    }
  } catch (error) {
    console.warn("Failed to read kill switch banners from sessionStorage", error);
  }
}

const listeners = new Set<Listener>();

function persist(banners: KillSwitchBanner[]) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
  } catch (error) {
    console.warn("Failed to persist kill switch banners", error);
  }
}

function notify() {
  listeners.forEach((listener) => {
    listener([...currentBanners]);
  });
}

export function getKillSwitchBanners(): KillSwitchBanner[] {
  return [...currentBanners];
}

export function setKillSwitchBanners(next: KillSwitchBanner[]): void {
  currentBanners = [...next];
  persist(currentBanners);
  notify();
}

export function subscribeToKillSwitchBanners(listener: Listener): () => void {
  listeners.add(listener);
  listener([...currentBanners]);
  return () => {
    listeners.delete(listener);
  };
}
