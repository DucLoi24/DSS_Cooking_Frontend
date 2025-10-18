import { useAuthStore } from './store';

// Lấy BASE_URL từ biến môi trường, nếu không có thì dùng localhost cho môi trường dev
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

const apiFetch = async (endpoint: string, options: RequestInit & { token?: string } = {}) => {
    const { accessToken: storeAccessToken, refreshToken, setTokens, logout } = useAuthStore.getState();

    const currentToken = options.token || storeAccessToken;

    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }
    if (currentToken) {
        headers.set('Authorization', `Bearer ${currentToken}`);
    }

    // --- LOGIC SỬA LỖI NẰM Ở ĐÂY ---
    // 1. Đảm bảo endpoint luôn bắt đầu bằng dấu gạch chéo
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // 2. Xây dựng URL cuối cùng
    const url = `${BASE_URL}/api${normalizedEndpoint}`;

    console.log(`Sending request to: ${url}`); // Thêm log để debug

    const { token, ...fetchOptions } = options;
    const config: RequestInit = { ...fetchOptions, headers };

    let response = await fetch(url, config);

    // Logic làm mới token vẫn giữ nguyên và cực kỳ quan trọng
    if (response.status === 401 && refreshToken && !endpoint.includes('/token/refresh/')) {
        console.log("Access token expired or invalid. Attempting to refresh...");
        
        try {
            const refreshResponse = await fetch(`${BASE_URL}/api/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (!refreshResponse.ok) {
                logout();
                window.location.href = '/login';
                throw new Error("Session expired. Please log in again.");
            }

            const newTokens = await refreshResponse.json();
            const newAccessToken = newTokens.access;

            setTokens(newAccessToken, refreshToken);
            headers.set('Authorization', `Bearer ${newAccessToken}`);

            console.log("Retrying the original request...");
            response = await fetch(url, { ...config, headers });

        } catch (error) {
            logout();
            window.location.href = '/login';
            throw error;
        }
    }

    return response;
};

export default apiFetch;