
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const userEmail = request.nextUrl.searchParams.get('user_email');

  if (!userEmail) {
    return NextResponse.json({ error: 'User email is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

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

    const { data: newNote, error } = await supabase
      .from('notes')
      .insert({
        user_email: body.user_email,
        notebook_id: body.notebook_id,
        title: body.title,
        content: body.content,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(newNote, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
