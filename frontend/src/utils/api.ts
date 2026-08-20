export const API_BASE: string = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : '';

export const getApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http')) return endpoint;
  return `${API_BASE}${endpoint}`;
};

export const customFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = getApiUrl(endpoint);
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`Server returned status ${res.status}`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};
