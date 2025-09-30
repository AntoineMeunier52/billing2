// DATA INTERFACE
interface User {
  id: number;
  email: string;
  name: string;
}

//API RESPONSE TYPE
type AuthSuccessResponse = { token: string; user: User };
type MeResponse = { user: User };
type SignupResult =
  | { success: true; user: User; token: string }
  | { success: false; error: string };

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(true);
  const isAuthenticated = computed(() => user.value !== null);

  function setUser(u: User) {
    user.value = u;
  }

  function setToken(t: string) {
    token.value = t;
    //change the store later to avoid XSS vulnerability
    localStorage.setItem("token", t);
  }

  function clearAuth() {
    user.value = null;
    token.value = null;

    localStorage.removeItem("token");
  }

  async function login(email: string, password: string) {
    try {
      const response = await $fetch<AuthSuccessResponse>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      setToken(response.token);
      setUser(response.user);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }

  async function signup(
    name: string,
    email: string,
    password: string
  ): Promise<SignupResult> {
    try {
      const response = await $fetch<AuthSuccessResponse>("/api/auth/signup", {
        method: "POST",
        body: { name, email, password },
      });
      setToken(response.token);
      setUser(response.user);
      return { success: true, user: response.user, token: response.token };
    } catch (error: any) {
      return {
        success: false,
        error: error?.data?.message ?? "Signup failed",
      };
    }
  }

  async function logout() {
    try {
      const t = localStorage.getItem("token");
      if (!t) return;
      await $fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
      });
    } finally {
      clearAuth();
      await navigateTo("/auth/login");
    }
  }

  async function checkAuth() {
    try {
      const t = localStorage.getItem("token");
      if (!t) return false;

      const response = await $fetch<MeResponse>("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${t}`,
        },
      });

      setToken(t);
      setUser(response.user);
      return true;
    } catch {
      clearAuth();
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    setUser,
    setToken,
    clearAuth,
    login,
    logout,
    signup,
    checkAuth,
  };
});

import.meta.client;

//reload the code in DEV mode and keep the store data
if (import.meta.hot) {
  import.meta.hot?.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
