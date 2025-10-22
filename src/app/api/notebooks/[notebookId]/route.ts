
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { notebookId: string } }
) {
  const supabase = createClient();
  const notebookId = params.notebookId;

  try {
    // RLS and table cascade will handle deleting associated notes
    const { error } = await supabase
      .from('notebooks')
      .delete()
      .eq('notebook_id', notebookId);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Notebook deleted successfully' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
