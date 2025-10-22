
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { inviteId: string } }
) {
  const supabase = createClient();
  const inviteId = params.inviteId;

  try {
    const body = await request.json();
    const { status } = body;

    if (!['accepted', 'declined'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    
    // The database trigger 'on_invite_accepted' will handle adding the user to the members table.
    // It should be updated to copy the 'role' from the invitation to the new member row.
    const { data: updatedInvite, error } = await supabase
      .from('invitations')
      .update({ status: status })
      .eq('invite_id', inviteId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating invitation:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(updatedInvite);
  } catch (e: any) {
    console.error('Error in PATCH /api/invitations/[inviteId]:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
