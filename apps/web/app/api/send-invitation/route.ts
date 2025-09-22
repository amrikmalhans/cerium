import { OrganizationInvitationEmail } from '../../../emails/organization-invitation';
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      to, 
      invitedByUsername, 
      invitedByEmail, 
      teamName, 
      inviteLink,
      inviteFromIp,
      inviteFromLocation 
    } = body;

    // Validate required fields
    if (!to || !invitedByUsername || !invitedByEmail || !teamName || !inviteLink) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Cerium <noreply@updates.cerium.sh>', // Change this to your verified domain
      to: [to],
      subject: `Join ${teamName} on Cerium`,
      react: OrganizationInvitationEmail({
        invitedByUsername,
        invitedByEmail,
        teamName,
        inviteLink,
        inviteFromIp,
        inviteFromLocation,
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id 
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' }, 
      { status: 500 }
    );
  }
}
