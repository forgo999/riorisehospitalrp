import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_URL } from "@/config";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  // Adicionar Content-Type se houver dados
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Adicionar x-user-id do localStorage para autenticação
  const storedUser = localStorage.getItem("hospital_user");
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user?.id) {
        headers["x-user-id"] = user.id;
      }
    } catch (e) {
      // Ignorar erro de parsing
    }
  }
  
  const res = await fetch(`${API_URL}${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    
    // Adicionar x-user-id do localStorage para autenticação
    const storedUser = localStorage.getItem("hospital_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.id) {
          headers["x-user-id"] = user.id;
        }
      } catch (e) {
        // Ignorar erro de parsing
      }
    }
    
    const res = await fetch(`${API_URL}${queryKey.join("/")}`, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
