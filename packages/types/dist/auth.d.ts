import type { User } from './db';
export interface AuthSession {
    user: User;
    session: {
        id: string;
        token: string;
        expiresAt: Date;
        activeOrganizationId?: string;
    };
}
export interface SignInCredentials {
    email: string;
    password: string;
}
export interface SignUpCredentials {
    name: string;
    email: string;
    password: string;
}
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
export interface BetterAuthResult<T = any> {
    data?: T;
    error: {
        message: string;
        code?: string;
    } | null;
}
export interface AuthResult<T = any> {
    data?: T;
    error?: AuthError;
}
export interface BetterAuthSession {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string;
        emailVerified: boolean;
    };
    session: {
        id: string;
        expiresAt: Date;
        token: string;
        activeOrganizationId?: string;
    };
}
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
