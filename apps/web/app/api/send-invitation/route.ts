import { NextRequest, NextResponse } from 'next/server';

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

    // TODO: Integrate Loops email service
    console.log('📧 Organization Invitation:', {
      to,
      invitedByUsername,
      invitedByEmail,
      teamName,
      inviteLink,
      inviteFromIp,
      inviteFromLocation
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation logged (email service not configured)'
    });
  } catch (error) {
    console.error('Invitation processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process invitation' }, 
      { status: 500 }
    );
  }
}
