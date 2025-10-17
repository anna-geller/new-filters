import type { AssetRecord } from "@/types/assets";
import { ASSETS } from "@/data/assets";

const CUSTOM_ASSETS_STORAGE_KEY = "app.customAssets";
const ASSETS_UPDATED_EVENT = "assets-updated";

function emitAssetsUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ASSETS_UPDATED_EVENT));
  }
}

function safeParseAssets(value: string | null): AssetRecord[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed as AssetRecord[];
    }
  } catch (error) {
    console.warn("Failed to parse stored custom assets", error);
  }

  return [];
}

export function loadCustomAssets(): AssetRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(CUSTOM_ASSETS_STORAGE_KEY);
  return safeParseAssets(raw);
}

export function saveCustomAssets(assets: AssetRecord[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CUSTOM_ASSETS_STORAGE_KEY, JSON.stringify(assets));
  emitAssetsUpdated();
}

export function upsertCustomAsset(asset: AssetRecord): void {
  if (typeof window === "undefined") {
    return;
  }

  const current = loadCustomAssets();
  const filtered = current.filter((item) => item.id !== asset.id);
  filtered.push(asset);
  saveCustomAssets(filtered);
}

export function deleteCustomAsset(assetId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const current = loadCustomAssets();
  const filtered = current.filter((asset) => asset.id !== assetId);
  if (filtered.length !== current.length) {
    saveCustomAssets(filtered);
  }
}

export function getAllAssets(): AssetRecord[] {
  const baseMap = new Map<string, AssetRecord>();
  for (const asset of ASSETS) {
    baseMap.set(asset.id, asset);
  }

  const customAssets = loadCustomAssets();
  for (const asset of customAssets) {
    baseMap.set(asset.id, asset);
  }

  return Array.from(baseMap.values());
}

export function getAssetById(assetId: string): AssetRecord | undefined {
  const allAssets = getAllAssets();
  return allAssets.find((asset) => asset.id === assetId);
}

export function isCustomAsset(assetId: string): boolean {
  const customAssets = loadCustomAssets();
  return customAssets.some((asset) => asset.id === assetId);
}

export function subscribeToAssetChanges(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => listener();
  window.addEventListener(ASSETS_UPDATED_EVENT, handler);
  return () => {
    window.removeEventListener(ASSETS_UPDATED_EVENT, handler);
  };
}

export function triggerAssetsUpdatedEvent() {
  emitAssetsUpdated();
}
