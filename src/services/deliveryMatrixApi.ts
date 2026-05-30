import { DeliveryZone } from "../types";

const API_BASE_URL = "/api/v1";

export interface DeliveryMatrixResponse {
  data: DeliveryZone[];
  pagination: {
    total_records: number;
    current_page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface DeliveryZoneFormData {
  township_name: string;
  region: string;
  division: string;
  rate: number;
  estimated_transit_timeline: string;
}

export async function fetchDeliveryMatrix(
  page: number = 1,
  limit: number = 10,
  search: string = "",
  address: string = ""
): Promise<DeliveryMatrixResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(address && { address }),
  });

  const response = await fetch(`${API_BASE_URL}/delivery-matrix?${params}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch delivery matrix: ${response.statusText}`);
  }

  return response.json();
}

export async function addDeliveryZone(zone: DeliveryZoneFormData): Promise<DeliveryZone> {
  const response = await fetch(`${API_BASE_URL}/delivery-matrix`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(zone),
  });

  if (!response.ok) {
    throw new Error(`Failed to add delivery zone: ${response.statusText}`);
  }

  return response.json();
}

export async function updateDeliveryZone(
  id: string,
  zone: Partial<DeliveryZoneFormData>
): Promise<DeliveryZone> {
  const response = await fetch(`${API_BASE_URL}/delivery-matrix/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(zone),
  });

  if (!response.ok) {
    throw new Error(`Failed to update delivery zone: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteDeliveryZone(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/delivery-matrix/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete delivery zone: ${response.statusText}`);
  }
}