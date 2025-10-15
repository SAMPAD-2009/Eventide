
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  // In a real app, you'd get the user from the session
  const userEmail = request.nextUrl.searchParams.get('user_email');

  if (!userEmail) {
    return NextResponse.json({ error: 'User email is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*, labels ( name, color )')
      .eq('user_email', userEmail)
      .order('datetime', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  try {
    const body = await request.json();

    const newRecord = {
      event_id: body.event_id,
      title: body.title,
      details: body.details,
      datetime: body.datetime,
      is_indefinite: body.is_indefinite,
      user_email: body.user_email,
      label_id: body.label_id,
      category: body.category,
    };

    const { data: newEvent, error } = await supabase
      .from('events')
      .insert(newRecord)
      .select('*, labels ( name, color )')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(newEvent, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
