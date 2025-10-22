
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// The GET functionality has been moved to the client-side for better RLS handling.

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  try {
    const body = await request.json();
    const { name, owner_email } = body;

    if (!name || !owner_email) {
        return NextResponse.json({ error: 'Name and owner_email are required' }, { status: 400 });
    }

    const { data: newCollaboration, error } = await supabase
      .from('collaborations')
      .insert({
        name: name,
        owner_email: owner_email,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating collaboration:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(newCollaboration, { status: 201 });
  } catch (e: any)
   {
    console.error('Error in POST /api/collaborations:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
