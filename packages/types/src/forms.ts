import { z } from "zod";

// Form schemas and types
export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
}

// Zod schemas for form validation
export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z.string()
    .min(1, "Organization slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .refine((val) => !val.startsWith("-") && !val.endsWith("-"), "Slug cannot start or end with a hyphen"),
});

// Form data types
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type CreateOrganizationFormData = z.infer<typeof createOrganizationSchema>;

export interface InvitationAcceptance {
  invitationId: string;
  name?: string;
  password?: string;
}

export type AuthProvider = 'google' | 'github' | 'credentials';

export interface AuthError {
  message: string;
  code?: string;
}

// Better Auth result types - matches the actual library response
export interface BetterAuthResult<T = any> {
  data?: T;
  error: {
    message: string;
    code?: string;
  } | null;
}

// Generic auth result for our app
export interface AuthResult<T = any> {
  data?: T;
  error?: AuthError;
}

// Dashboard-specific types
export interface DashboardStats {
  memberCount: number;
  documentCount: number;
  searchCount: number;
}

export interface OrganizationSwitchEvent {
  fromOrgId?: string;
  toOrgId: string;
  timestamp: Date;
}
