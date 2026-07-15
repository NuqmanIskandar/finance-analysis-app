const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function getToken() {
    return localStorage.getItem("fid_token");
}

export function setToken(token) {
    if (token) {
        localStorage.setItem("fid_token", token);
    } else {
        localStorage.removeItem("fid_token");
    }
}

async function request(path, options = {}) {
    const token = getToken();
    const headers = {...(options.headers || {})};

    if (options.body && !(options.body instanceof URLSearchParams)) {
        headers["Content-Type"] = "application/json";
    }
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {...options, headers});

    if (!response.ok) {
        let detail = response.statusText;
        try {
            const body = await response.json();
            detail = body.detail || detail;
        } catch {
            // response wasn't JSON, keep statusText
        }

        const isAuthEndpoint = path.startsWith("/auth/login") || path.startsWith("/auth/register");
        if (response.status === 401 && !isAuthEndpoint) {
            setToken(null);
            window.dispatchEvent(new Event("auth:expired"));
        }

        const error = new Error(detail);
        error.status = response.status;
        throw error;
    }

    if (response.status === 204) return null;
    return response.json()
}

export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
    del: (path) => request(path, { method: "DELETE"}),

    login: (username, password) => {
        const form = new URLSearchParams();
        form.append("username", username);
        form.append("password", password);
        return request("/auth/login", { method: "POST", body: form });
    },
    register: (username, password) => request("/auth/register", { method: "POST", body: JSON.stringify({ username, password }) }),

    create_category: (name) => request(`/categories?name=${encodeURIComponent(name)}`, { method: "POST" }),
    delete_category: (category_id) => request(`/categories/${category_id}`, { method: "DELETE"}),

    create_transaction: (transaction) => request("/transactions", { method: "POST", body: JSON.stringify(transaction) }),
    list_transactions: (filters) => {
        const params = [];
        if (filters.start !== null) params.push(`start=${encodeURIComponent(filters.start)}`);
        if (filters.end !== null) params.push(`end=${encodeURIComponent(filters.end)}`);
        if (filters.category_id !== null) params.push(`category_id=${encodeURIComponent(filters.category_id)}`);
        if (filters.type !== null) params.push(`type=${encodeURIComponent(filters.type)}`);

        const query = params.length ? `?${params.join("&")}` : "";
        return request("/transactions" + query);
    },
    get_transaction: (transaction_id) => request(`/transactions/${transaction_id}`),
    delete_transaction: (transaction_id) => request(`/transactions/${transaction_id}`, { method: "DELETE" }),
}

export { getToken };