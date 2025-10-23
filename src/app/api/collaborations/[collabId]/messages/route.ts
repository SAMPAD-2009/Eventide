
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { collabId: string } }
) {
  const supabase = createClient();
  const collabId = params.collabId;

  try {
    // RLS will ensure the user is a member of the collab
    const { data, error } = await supabase
      .from('collaboration_messages')
      .select('*')
      .eq('collab_id', collabId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error fetching messages:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    console.error('Error in GET /api/collaborations/[collabId]/messages:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


export async function POST(
  request: NextRequest,
  { params }: { params: { collabId: string } }
) {
  const supabase = createClient();
  const collabId = params.collabId;

  try {
    const body = await request.json();
    const { content, user_email } = body;

    if (!user_email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
    }

    // RLS will ensure the user is a member of the collab when they query,
    // but for inserts we rely on the server role key and trust the passed email.
    const { data: newMessage, error } = await supabase
      .from('collaboration_messages')
      .insert({
        collab_id: collabId,
        user_email: user_email,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error inserting message:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(newMessage, { status: 201 });
  } catch (e: any) {
    console.error('Error in POST /api/collaborations/[collabId]/messages:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
