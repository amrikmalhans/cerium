import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:9999",
  plugins: [
    organizationClient()
  ],
});

export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession,
  organization 
} = authClient;
