import type { AssetRecord } from "@/types/assets";

export function normalizeAssetNamespace(namespace?: string): string {
  return namespace?.trim() || "default";
}

export function composeAssetKey(namespace: string, assetId: string): string {
  return `${normalizeAssetNamespace(namespace)}/${assetId.trim()}`;
}

export function buildAssetKeyFromRecord(asset: AssetRecord): string {
  return composeAssetKey(asset.namespace, asset.id);
}

export function parseAssetKey(key: string): { namespace: string; id: string } {
  const normalized = key.trim();
  if (!normalized) {
    return { namespace: "default", id: "" };
  }

  const segments = normalized.split("/");
  if (segments.length <= 1) {
    return {
      namespace: "default",
      id: normalized,
    };
  }

  const [namespace, ...rest] = segments;
  const id = rest.join("/").trim();

  return {
    namespace: normalizeAssetNamespace(namespace),
    id,
  };
}
