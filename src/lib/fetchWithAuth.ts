interface TokenPair {
  access_token: string;
  refresh_token: string;
}

let isRefreshing = false;
let refreshPromise: Promise<TokenPair> | null = null;

const refreshAccessToken = async (baseUrl: string): Promise<TokenPair> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${baseUrl}/public/login/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const tokenPair = {
        access_token: data.token_pair.access_token,
        refresh_token: data.token_pair.refresh_token,
      };

      localStorage.setItem('accessToken', tokenPair.access_token);
      localStorage.setItem('refreshToken', tokenPair.refresh_token);

      return tokenPair;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/auth';
      throw new Error('Token refresh failed');
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const createFetchWithAuth = (baseUrl: string) => {
  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('accessToken');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      try {
        await refreshAccessToken(baseUrl);
        const newToken = localStorage.getItem('accessToken');
        
        const newHeaders = {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        };
        
        response = await fetch(url, { ...options, headers: newHeaders });
      } catch (error) {
        throw error;
      }
    }

    return response;
  };
};
