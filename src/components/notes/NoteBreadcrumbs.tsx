
"use client";

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Note, Notebook } from '@/lib/types';

interface NoteBreadcrumbsProps {
  notebook?: Notebook;
  note?: Note;
}

export function NoteBreadcrumbs({ notebook, note }: NoteBreadcrumbsProps) {
  return (
    <nav className="flex items-center text-sm font-medium text-muted-foreground">
      <Link href="/notes" className="hover:text-primary">Dashboard</Link>
      {notebook && (
        <>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href={`/notes/${notebook.notebook_id}`} className="hover:text-primary truncate max-w-48">
            {notebook.name}
          </Link>
        </>
      )}
      {note && (
        <>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-foreground truncate max-w-48">{note.title || 'Untitled'}</span>
        </>
      )}
    </nav>
  );
}
