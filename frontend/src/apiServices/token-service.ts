const TOKEN_KEY = "eventchimp_token";

export const tokenService = {
  getToken: () => (typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null),
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_KEY, token);
    }
  },
  removeToken: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  }
};
