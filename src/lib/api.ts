const API_BASE = 'http://localhost:5000/api';

const handleResponse = async (res: Response, defaultMessage: string) => {
    if (!res.ok) {
        let errorMsg = defaultMessage;
        try {
            const errBody = await res.json();
            if (errBody.error) errorMsg = errBody.error;
        } catch(e) {}
        throw new Error(errorMsg);
    }
    return res.json();
};

export async function fetchDashboardStats() {
    return handleResponse(await fetch(`${API_BASE}/dashboard/stats`), 'Failed to fetch stats');
}

export async function fetchAssets() {
    return handleResponse(await fetch(`${API_BASE}/assets`), 'Failed to fetch assets');
}

export async function fetchAsset(id: string) {
    return handleResponse(await fetch(`${API_BASE}/assets/${id}`), 'Failed to fetch asset');
}

export async function createAsset(data: any) {
    return handleResponse(await fetch(`${API_BASE}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }), 'Failed to create asset');
}

export async function updateAsset(id: string, data: any) {
    return handleResponse(await fetch(`${API_BASE}/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }), 'Failed to update asset');
}

export async function fetchUsers() {
    return handleResponse(await fetch(`${API_BASE}/users`), 'Failed to fetch users');
}

export async function fetchUser(id: string) {
    return handleResponse(await fetch(`${API_BASE}/users/${id}`), 'Failed to fetch user');
}

export async function createUser(data: any) {
    return handleResponse(await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }), 'Failed to create user');
}

export async function fetchHistory() {
    return handleResponse(await fetch(`${API_BASE}/assignments/history`), 'Failed to fetch history');
}

export async function assignAsset(data: { assetId: string, userId: string, remarks?: string }) {
    return handleResponse(await fetch(`${API_BASE}/assignments/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }), 'Failed to assign asset');
}

export async function returnAsset(data: { assetId: string, remarks?: string }) {
    return handleResponse(await fetch(`${API_BASE}/assignments/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }), 'Failed to return asset');
}

export async function fetchWithdrawnReports() {
    return handleResponse(await fetch(`${API_BASE}/withdrawals/reports`), 'Failed to fetch withdrawn reports');
}

export async function createWithdrawnReport(data: any) {
    return handleResponse(await fetch(`${API_BASE}/withdrawals/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }), 'Failed to create withdrawn report');
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

// Vendor Endpoints
export async function fetchVendors() {
    const res = await fetch(`${API_BASE}/vendors`);
    if (!res.ok) throw new Error('Failed to fetch vendors');
    return res.json();
}

export async function fetchVendor(id: string) {
    const res = await fetch(`${API_BASE}/vendors/${id}`);
    if (!res.ok) throw new Error('Failed to fetch vendor');
    return res.json();
}

export async function fetchVendorAssets(id: string) {
    const res = await fetch(`${API_BASE}/vendors/${id}/assets`);
    if (!res.ok) throw new Error('Failed to fetch vendor assets');
    return res.json();
}
