const API_BASE = 'http://localhost:5000/api';

export async function fetchDashboardStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
}

export async function fetchAssets() {
    const res = await fetch(`${API_BASE}/assets`);
    if (!res.ok) throw new Error('Failed to fetch assets');
    return res.json();
}

export async function fetchAsset(id: string) {
    const res = await fetch(`${API_BASE}/assets/${id}`);
    if (!res.ok) throw new Error('Failed to fetch asset');
    return res.json();
}

export async function createAsset(data: any) {
    const res = await fetch(`${API_BASE}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create asset');
    return res.json();
}

export async function updateAsset(id: string, data: any) {
    const res = await fetch(`${API_BASE}/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update asset');
    return res.json();
}

export async function fetchUsers() {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
}

export async function fetchUser(id: string) {
    const res = await fetch(`${API_BASE}/users/${id}`);
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
}

export async function createUser(data: any) {
    const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
}

export async function fetchHistory() {
    const res = await fetch(`${API_BASE}/assignments/history`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
}

export async function assignAsset(data: { assetId: string, userId: string, remarks?: string }) {
    const res = await fetch(`${API_BASE}/assignments/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to assign asset');
    return res.json();
}

// Master Tables fetchers
export async function fetchDepartments() {
    const res = await fetch(`${API_BASE}/masters/departments`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((d: any) => d.department_name);
}

export async function fetchLocations() {
    const res = await fetch(`${API_BASE}/masters/locations`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((d: any) => d.location_name);
}

export async function fetchAssetTypes() {
    const res = await fetch(`${API_BASE}/masters/asset-types`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((d: any) => d.asset_type_name);
}
