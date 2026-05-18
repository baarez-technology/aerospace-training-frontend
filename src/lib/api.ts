const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

let refreshPromise: Promise<string | null> | null = null;

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const session = typeof window !== 'undefined' ? localStorage.getItem('iaf_training_session') : null;
  const token = session ? JSON.parse(session).token : null;

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        const sessionStr = localStorage.getItem('iaf_training_session');
        const session = sessionStr ? JSON.parse(sessionStr) : null;
        const refreshToken = session?.refresh_token;

        // Avoid infinite loops and handle missing refresh tokens
        if (refreshToken && endpoint !== '/auth/refresh') {
          try {
            // Use a shared promise for concurrent 401s
            if (!refreshPromise) {
              refreshPromise = (async () => {
                try {
                  const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                  });

                  if (refreshResponse.ok) {
                    const refreshResult = await refreshResponse.json();
                    const newData = refreshResult.data;
                    const newToken = newData.access_token || newData.token;
                    
                    const newSession = {
                      ...session,
                      token: newToken,
                      refresh_token: newData.refresh_token || refreshToken,
                    };
                    localStorage.setItem('iaf_training_session', JSON.stringify(newSession));
                    return newToken;
                  }
                } catch (e) {
                  console.error('Refresh call failed', e);
                } finally {
                  refreshPromise = null;
                }
                return null;
              })();
            }

            const newToken = await refreshPromise;
            if (newToken) {
              // Retry with new token
              return apiFetch<T>(endpoint, options);
            }
          } catch (refreshError) {
            console.error('Token refresh logic failed:', refreshError);
          }
        }

        // If we reach here, refresh failed or was not possible
        // Don't redirect if we're already on the login page or in a redirect loop
        const currentPath = window.location.pathname;
        if (currentPath !== '/' && !currentPath.includes('login')) {
          localStorage.removeItem('iaf_training_session');
          window.location.href = '/?expired=true';
          // Return a promise that never resolves to stop execution of the current chain
          return new Promise(() => {});
        }
      }
    }
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
    const errorMessage = errorData.error?.message || errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  const result = await response.json();
  
  // Handle new API response structure with "data" wrapper
  if (result && typeof result === 'object' && 'data' in result) {
    const data = result.data;
    
    // Compatibility mapping helper
    const mapCompatibility = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      if (Array.isArray(obj)) {
        obj.forEach(item => mapCompatibility(item));
        return;
      }
      
      if (obj.access_token && !obj.token) obj.token = obj.access_token;
      if (obj.full_name && !obj.name) obj.name = obj.full_name;
      if (obj.roles && Array.isArray(obj.roles) && !obj.role) {
        if (obj.roles.includes('admin')) {
          obj.role = 'admin';
        } else if (obj.roles.includes('instructor')) {
          obj.role = 'instructor';
        } else {
          obj.role = obj.roles[0];
        }
      }
      
      if (obj.user && typeof obj.user === 'object') {
        mapCompatibility(obj.user);
      }
    };

    mapCompatibility(data);
    return data as T;
  }

  return result;
}
