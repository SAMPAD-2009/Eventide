
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
      .from('projects')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }
    
    // Ensure "Inbox" is first
    if (data) {
        data.sort((a, b) => {
            if (a.name === 'Inbox') return -1;
            if (b.name === 'Inbox') return 1;
            return 0;
        });
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

    const { data: newProject, error } = await supabase
      .from('projects')
      .insert({
        user_email: body.user_email,
        name: body.name,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(newProject, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
