
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

    if (collabIds.length === 0) {
        return NextResponse.json([], { status: 200 });
    }

    // Fetch the full collaboration details for those IDs
    const { data, error } = await supabase
      .from('collaborations')
      .select('*')
      .in('collab_id', collabIds);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
