
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const userEmail = request.nextUrl.searchParams.get('user_email');

  if (!userEmail) {
    return NextResponse.json({ error: 'User email is required' }, { status: 400 });
  }

  try {
    // We can use the service role here to fetch invites for a specific user.
    // RLS policies will still protect client-side access.
    const { data, error } = await supabase
      .from('invitations')
      .select('*, collaborations ( name )')
      .eq('invitee_email', userEmail);

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (e: any) {
    console.error('Error fetching invitations:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  try {
    const body = await request.json();
    const { collab_id, inviter_email, invitee_email, role } = body;

    // TODO: Add validation to ensure the inviter is a member/owner of the collab

    const { data: newInvite, error } = await supabase
      .from('invitations')
      .insert({
        collab_id,
        inviter_email,
        invitee_email,
        role: role || 'editor', // Default to editor if role is not provided
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation (user already invited)
      if (error.code === '23505') {
           return NextResponse.json({ error: 'This user has already been invited to this space.' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json(newInvite, { status: 201 });
  } catch (e: any) {
    console.error('Error in POST /api/invitations:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
