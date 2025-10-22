
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { labelId: string } }
) {
  const supabase = createClient();
  const labelId = params.labelId;

  try {
    const body = await request.json();
    const { data: updatedLabel, error } = await supabase
      .from('labels')
      .update(body)
      .eq('label_id', labelId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(updatedLabel);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { labelId: string } }
) {
  const supabase = createClient();
  const labelId = params.labelId;

  try {
    // Note: RLS policies or DB schema should handle setting label_id to null in todos/events
    const { error } = await supabase
      .from('labels')
      .delete()
      .eq('label_id', labelId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Label deleted successfully' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
