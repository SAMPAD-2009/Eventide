
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { todoId: string } }
) {
  const supabase = createClient();
  const todoId = params.todoId;

  try {
    const body = await request.json();
    const { data: updatedTodo, error } = await supabase
      .from('todos')
      .update(body) // flexible update
      .eq('todo_id', todoId)
      .select('*, labels ( name, color, label_id )')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(updatedTodo);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { todoId: string } }
) {
  const supabase = createClient();
  const todoId = params.todoId;

  try {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('todo_id', todoId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Todo deleted successfully' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
