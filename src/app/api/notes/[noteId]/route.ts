
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  const supabase = createClient();
  const noteId = params.noteId;

  try {
    const body = await request.json();
    const { data: updatedNote, error } = await supabase
      .from('notes')
      .update({
        title: body.title,
        content: body.content,
      })
      .eq('note_id', noteId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(updatedNote);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  const supabase = createClient();
  const noteId = params.noteId;

  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('note_id', noteId);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Note deleted successfully' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
