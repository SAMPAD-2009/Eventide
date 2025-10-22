
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const supabase = createClient();
  const eventId = params.eventId;

  try {
    const body = await request.json();
    const { data: updatedEvent, error } = await supabase
      .from('events')
      .update({
        title: body.title,
        details: body.details,
        datetime: body.datetime,
        is_indefinite: body.isIndefinite,
        label_id: body.label_id,
        category: body.category,
      })
      .eq('event_id', eventId)
      .select('*, labels ( name, color )')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(updatedEvent);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const supabase = createClient();
  const eventId = params.eventId;

  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('event_id', eventId);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
