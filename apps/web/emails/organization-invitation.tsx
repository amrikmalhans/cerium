import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface OrganizationInvitationEmailProps {
  invitedByUsername?: string;
  invitedByEmail?: string;
  teamName?: string;
  inviteLink?: string;
  inviteFromIp?: string;
  inviteFromLocation?: string;
}

const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

export const OrganizationInvitationEmail = ({
  invitedByUsername = 'John Doe',
  invitedByEmail = 'john@example.com',
  teamName = 'Acme Engineering',
  inviteLink = `${baseUrl}/accept-invitation/abc123`,
  inviteFromIp = '204.13.186.218',
  inviteFromLocation = 'São Paulo, Brazil',
}: OrganizationInvitationEmailProps) => {
  const previewText = `Join ${teamName} on Cerium`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`${baseUrl}/Sprinkle.svg`}
              width="40"
              height="40"
              alt="Cerium"
              style={logo}
            />
          </Section>
          <Heading style={h1}>Join {teamName} on Cerium</Heading>
          <Text style={heroText}>
            <strong>{invitedByUsername}</strong> (
            <Link href={`mailto:${invitedByEmail}`} style={link}>
              {invitedByEmail}
            </Link>
            ) has invited you to the <strong>{teamName}</strong> team on Cerium.
          </Text>

          <Section style={codeBox}>
            <Text style={confirmationCodeText}>
              Cerium helps engineering teams centralize and search their operational knowledge - 
              from runbooks and ADRs to Slack discussions and GitHub issues.
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={inviteLink}>
              Join {teamName}
            </Button>
          </Section>

          <Text style={paragraph}>
            <strong>What you&apos;ll get access to:</strong>
          </Text>
          <Text style={paragraph}>
            • 🔍 AI-powered search across all your team&apos;s knowledge
            <br />
            • 📚 Centralized runbooks, postmortems, and decisions
            <br />
            • 🤝 Collaborative knowledge building with your team
            <br />
            • 📈 Faster onboarding and incident resolution
          </Text>

          <Hr style={hr} />

          <Text style={paragraph}>
            This invitation was intended for you and was sent from{' '}
            <span style={code}>{inviteFromIp}</span> located in{' '}
            {inviteFromLocation}. If you were not expecting this invitation, you
            can ignore this email.
          </Text>

          <Text style={paragraph}>
            If you&apos;re having trouble clicking the button, copy and paste the URL below
            into your web browser:
          </Text>
          <Text style={paragraph}>
            <Link href={inviteLink} style={link}>
              {inviteLink}
            </Link>
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            <Link href={baseUrl} style={link}>
              Cerium
            </Link>
            , the AI-powered knowledge base for engineering teams.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrganizationInvitationEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const logoContainer = {
  marginTop: '32px',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#333',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const heroText = {
  color: '#333',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
};

const codeBox = {
  background: 'rgb(245, 244, 245)',
  borderRadius: '4px',
  margin: '16px auto 14px',
  verticalAlign: 'middle',
  width: '280px',
  maxWidth: '100%',
  padding: '16px',
};

const confirmationCodeText = {
  color: '#333',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
  textAlign: 'center' as const,
};

const buttonContainer = {
  margin: '27px auto',
  width: 'auto',
};

const button = {
  backgroundColor: '#5e6ad2',
  borderRadius: '3px',
  fontWeight: '600',
  color: '#fff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '11px 23px',
};

const paragraph = {
  color: '#333',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
};

const link = {
  color: '#5e6ad2',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#cccccc',
  borderStyle: 'solid',
  borderWidth: '1px',
  margin: '20px 0',
};

const code = {
  display: 'inline-block',
  padding: '16px 4.5%',
  width: '90.5%',
  backgroundColor: '#f4f4f4',
  borderRadius: '5px',
  border: '1px solid #eee',
  color: '#333',
};

const footer = {
  color: '#898989',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
};
