import { apiFetch } from './api';

export interface Asset {
  id: string;
  aircraft_id: string | null;
  asset_type: string;
  fidelity: string;
  format: string;
  version: string;
  file_size_bytes: number | null;
  checksum_sha256?: string;
}

export interface AssetDownload {
  asset_id: string;
  download_url: string;
  expires_in_seconds: number;
  format: string;
}

export async function listAssets(params?: {
  aircraft_id?: string;
  asset_type?: string;
  fidelity?: string;
}): Promise<Asset[]> {
  const query = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  return apiFetch<Asset[]>(`/assets${query ? `?${query}` : ''}`);
}

export async function getAsset(assetId: string): Promise<Asset> {
  return apiFetch<Asset>(`/assets/${assetId}`);
}

export async function getAssetDownloadUrl(assetId: string): Promise<AssetDownload> {
  return apiFetch<AssetDownload>(`/assets/${assetId}/download`);
}
