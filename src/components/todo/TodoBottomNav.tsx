
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Inbox, Calendar, LayoutGrid, Folder as FolderIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { ProjectsSheet } from './ProjectsSheet';

interface TodoBottomNavProps {
  selectedSection: string;
  onSelectSection: (section: string) => void;
}

export function TodoBottomNav({ selectedSection, onSelectSection }: TodoBottomNavProps) {
  const pathname = usePathname();
  const [isProjectsSheetOpen, setProjectsSheetOpen] = useState(false);

  const mainSections = [
    { id: 'inbox', name: 'Inbox', icon: Inbox },
    { id: 'today', name: 'Today', icon: Calendar },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50">
        <nav className="grid grid-cols-4 h-full">
          {mainSections.map((section) => (
            <Button
              key={section.id}
              variant="ghost"
              className={cn(
                "flex flex-col h-full items-center justify-center rounded-none text-xs gap-1",
                selectedSection === section.id && pathname === '/todo'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
              onClick={() => onSelectSection(section.id)}
            >
              <section.icon className="h-5 w-5" />
              {section.name}
            </Button>
          ))}
          <Button
            asChild
            variant="ghost"
            className={cn(
              "flex flex-col h-full items-center justify-center rounded-none text-xs gap-1",
              pathname === '/todo-calendar' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Link href="/todo-calendar">
              <LayoutGrid className="h-5 w-5" />
              Upcoming
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col h-full items-center justify-center rounded-none text-xs gap-1 text-muted-foreground"
            onClick={() => setProjectsSheetOpen(true)}
          >
            <FolderIcon className="h-5 w-5" />
            Projects
          </Button>
        </nav>
      </div>
      <ProjectsSheet 
        isOpen={isProjectsSheetOpen} 
        onOpenChange={setProjectsSheetOpen} 
        selectedSection={selectedSection}
        onSelectSection={onSelectSection}
      />
    </>
  );
}
