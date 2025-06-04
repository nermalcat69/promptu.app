import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
  fetchOptions: {
    onError(context) {
      // Handle auth errors gracefully
      if (context.response.status === 404) {
        console.warn("Auth endpoint not found, user may not be authenticated");
      }
    },
  },
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
} = authClient;
