import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import * as schema from '@cerium/db/src/schema';
export type User = InferSelectModel<typeof schema.user>;
export type NewUser = InferInsertModel<typeof schema.user>;
export type UserUpdate = Partial<NewUser>;
export type PublicUser = Omit<User, 'emailVerified'>;
export type Session = InferSelectModel<typeof schema.session>;
export type NewSession = InferInsertModel<typeof schema.session>;
export type Account = InferSelectModel<typeof schema.account>;
export type NewAccount = InferInsertModel<typeof schema.account>;
export type Verification = InferSelectModel<typeof schema.verification>;
export type NewVerification = InferInsertModel<typeof schema.verification>;
export type Organization = InferSelectModel<typeof schema.organization>;
export type NewOrganization = InferInsertModel<typeof schema.organization>;
export type OrganizationUpdate = Partial<NewOrganization>;
export type Member = InferSelectModel<typeof schema.member>;
export type NewMember = InferInsertModel<typeof schema.member>;
export type MemberRole = 'admin' | 'member' | 'viewer';
export type Invitation = InferSelectModel<typeof schema.invitation>;
export type NewInvitation = InferInsertModel<typeof schema.invitation>;
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';
export type UserWithOrganizations = User & {
    organizations: (Member & {
        organization: Organization;
    })[];
};
export type OrganizationWithMembers = Organization & {
    members: (Member & {
        user: PublicUser;
    })[];
};
export type MemberWithUser = Member & {
    user: PublicUser;
};
export type MemberWithOrganization = Member & {
    organization: Organization;
};
export type InvitationWithDetails = Invitation & {
    organization: Organization;
    inviter: PublicUser;
};
