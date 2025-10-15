
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
      .from('labels')
      .select('*')
      .eq('user_email', userEmail)
      .order('name', { ascending: true });

    if (error) {
      throw error;
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

    const { data: newLabel, error } = await supabase
      .from('labels')
      .insert({
        user_email: body.user_email,
        name: body.name,
        color: body.color,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(newLabel, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
