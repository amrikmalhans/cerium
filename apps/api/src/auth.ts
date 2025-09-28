import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import * as schema from "@cerium/db/src/schema";
import db from "@cerium/db/src/index";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:9999",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
  },
  socialProviders: {
    // Add social providers as needed
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID as string,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    // },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:9999",
    process.env.CLIENT_ORIGIN || "http://localhost:3000"
  ],
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 10,
      membershipLimit: 50,
      invitationExpiresIn: 60 * 60 * 24 * 7,
      async sendInvitationEmail(data) {
        try {
          const baseUrl = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
          const inviteLink = `${baseUrl}/accept-invitation/${data.id}`;
          
          const response = await fetch(`${baseUrl}/api/send-invitation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: data.email,
              invitedByUsername: data.inviter.user.name || data.inviter.user.email,
              invitedByEmail: data.inviter.user.email,
              teamName: data.organization.name,
              inviteLink,
              inviteFromIp: '127.0.0.1',
              inviteFromLocation: 'Unknown',
            }),
          });

          if (!response.ok) {
            const error = await response.json() as { error: string };
            throw new Error(error.error || 'Failed to send email');
          }

          console.log(`✅ Invitation email sent to ${data.email} for organization ${data.organization.name}`);
        } catch (error) {
          console.error('❌ Failed to send invitation email:', error);
        }
      },
    }),
  ],
});
