import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  fetchOptions: {
    onError(context) {
      // Handle auth errors gracefully
      if (context.response.status === 404) {
        console.warn("Auth endpoint not found, user may not be authenticated");
      } else if (context.response.status === 401) {
        console.warn("User is not authenticated");
      } else if (context.response.status >= 500) {
        console.error("Server error during auth request:", context.response.status);
      }
    },
  },
});

// Export all client methods
export const signIn = authClient.signIn;
export const signOut = authClient.signOut;
export const signUp = authClient.signUp;
export const getSession = authClient.getSession;
export const deleteUser = authClient.deleteUser;

// Export the session hook for React components
export const useSession = authClient.useSession;
