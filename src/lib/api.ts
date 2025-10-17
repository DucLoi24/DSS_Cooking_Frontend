import { useAuthStore } from './store';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    // Chúng ta lấy state trực tiếp, vì hàm này không phải là một hook
    const { accessToken, refreshToken, setTokens, logout } = useAuthStore.getState();

    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }
    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    let response = await fetch(`${BASE_URL}${endpoint}`, config);

    // Nếu response là 401, token có thể đã hết hạn, thử làm mới
    if (response.status === 401 && refreshToken) {
        console.log("Access token expired. Attempting to refresh...");
        
        try {
            const refreshResponse = await fetch(`${BASE_URL}/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (!refreshResponse.ok) {
                console.error("Refresh token is invalid or expired. Logging out.");
                logout();
                window.location.href = '/login'; // Chuyển hướng về trang đăng nhập
                throw new Error("Session expired. Please log in again.");
            }

            const newTokens = await refreshResponse.json();
            const newAccessToken = newTokens.access;

            // Cập nhật store với access token mới
            setTokens(newAccessToken, refreshToken);
            console.log("Token refreshed successfully.");

            // Cập nhật header với token mới
            headers.set('Authorization', `Bearer ${newAccessToken}`);

            // Thử lại request ban đầu với token mới
            console.log("Retrying the original request...");
            response = await fetch(`${BASE_URL}${endpoint}`, { ...config, headers });

        } catch (error) {
            console.error("Could not refresh token:", error);
            logout();
            window.location.href = '/login';
            throw error; // Ném lỗi ra ngoài để component có thể xử lý
        }
    }

    return response;
};

export default apiFetch;