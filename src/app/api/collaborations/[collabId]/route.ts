
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { collabId: string } }
) {
  const supabase = createClient();
  const collabId = params.collabId;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: collaboration, error: ownerError } = await supabase
        .from('collaborations')
        .select('owner_email')
        .eq('collab_id', collabId)
        .single();
    
    if (ownerError || !collaboration) {
        return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 });
    }

    if (collaboration.owner_email !== user.email) {
        return NextResponse.json({ error: 'Only the owner can rename the space' }, { status: 403 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'A valid name is required' }, { status: 400 });
    }

    const { data: updatedCollaboration, error: updateError } = await supabase
      .from('collaborations')
      .update({ name: name.trim() })
      .eq('collab_id', collabId)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase error renaming collaboration:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json(updatedCollaboration, { status: 200 });
  } catch (e: any) {
    console.error('Error in PATCH /api/collaborations/[collabId]:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

    