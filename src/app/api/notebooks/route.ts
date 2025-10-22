
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const userEmail = request.nextUrl.searchParams.get('user_email');

  if (!userEmail) {
    return NextResponse.json({ error: 'User email is required' }, { status: 400 });
  }

  try {
     // Get all collaboration IDs the user is a member of
    const { data: memberCollabs, error: memberError } = await supabase
      .from('collaboration_members')
      .select('collab_id')
      .eq('user_email', userEmail);

    if (memberError) {
        console.error('Supabase error fetching memberships:', memberError);
        return NextResponse.json({ error: memberError.message }, { status: 400 });
    }
    
    const collabIds = memberCollabs.map(m => m.collab_id);

    const { data, error } = await supabase
      .from('notebooks')
      .select('*, collaborations ( name )')
      .or(`user_email.eq.${userEmail},collab_id.in.(${collabIds.join(',')})`)
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

    const { data: newNotebook, error } = await supabase
      .from('notebooks')
      .insert({
        user_email: body.user_email,
        name: body.name,
        collab_id: body.collab_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(newNotebook, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
