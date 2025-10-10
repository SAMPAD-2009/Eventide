
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const supabase = createClient();
  const projectId = params.projectId;

  try {
    // Note: RLS policies and DB schema should handle cascading deletes of todos
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('project_id', projectId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
