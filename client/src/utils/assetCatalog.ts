import type { AssetRecord } from "@/types/assets";
import { ASSETS } from "@/data/assets";
import { buildAssetKeyFromRecord, composeAssetKey, normalizeAssetNamespace } from "@/utils/assetKeys";

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
      return (parsed as AssetRecord[]).map((asset) => ({
        ...asset,
        id: asset.id.trim(),
        namespace: normalizeAssetNamespace(asset.namespace),
      }));
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

  const normalized = assets.map((asset) => ({
    ...asset,
    id: asset.id.trim(),
    namespace: normalizeAssetNamespace(asset.namespace),
  }));

  window.localStorage.setItem(CUSTOM_ASSETS_STORAGE_KEY, JSON.stringify(normalized));
  emitAssetsUpdated();
}

export function upsertCustomAsset(asset: AssetRecord): void {
  if (typeof window === "undefined") {
    return;
  }

  const candidate: AssetRecord = {
    ...asset,
    id: asset.id.trim(),
    namespace: normalizeAssetNamespace(asset.namespace),
  };
  const candidateKey = buildAssetKeyFromRecord(candidate);

  const current = loadCustomAssets().map((existing) => ({
    ...existing,
    id: existing.id.trim(),
    namespace: normalizeAssetNamespace(existing.namespace),
  }));

  const filtered = current.filter((item) => buildAssetKeyFromRecord(item) !== candidateKey);
  filtered.push(candidate);
  saveCustomAssets(filtered);
}

export function deleteCustomAsset(namespace: string, assetId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const targetKey = composeAssetKey(namespace, assetId);
  const current = loadCustomAssets();
  const filtered = current.filter((asset) => buildAssetKeyFromRecord(asset) !== targetKey);
  if (filtered.length !== current.length) {
    saveCustomAssets(filtered);
  }
}

export function getAllAssets(): AssetRecord[] {
  const baseMap = new Map<string, AssetRecord>();

  for (const asset of ASSETS) {
    const normalized: AssetRecord = {
      ...asset,
      id: asset.id.trim(),
      namespace: normalizeAssetNamespace(asset.namespace),
    };
    baseMap.set(buildAssetKeyFromRecord(normalized), normalized);
  }

  const customAssets = loadCustomAssets();
  for (const asset of customAssets) {
    baseMap.set(buildAssetKeyFromRecord(asset), asset);
  }

  return Array.from(baseMap.values());
}

export function getAssetByKey(namespace: string, assetId: string): AssetRecord | undefined {
  const allAssets = getAllAssets();
  const targetKey = composeAssetKey(namespace, assetId);
  return allAssets.find((asset) => buildAssetKeyFromRecord(asset) === targetKey);
}

export function getAssetByCompositeKey(assetKey: string): AssetRecord | undefined {
  const allAssets = getAllAssets();
  return allAssets.find((asset) => buildAssetKeyFromRecord(asset) === assetKey);
}

export function isCustomAsset(namespace: string, assetId: string): boolean {
  const customAssets = loadCustomAssets();
  const targetKey = composeAssetKey(namespace, assetId);
  return customAssets.some((asset) => buildAssetKeyFromRecord(asset) === targetKey);
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
