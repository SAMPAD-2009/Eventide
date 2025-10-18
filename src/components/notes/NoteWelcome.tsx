
"use client";

import { Button } from "../ui/button";
import { NotebookPen } from "lucide-react";

interface NoteWelcomeProps {
    onCreateNew: () => void;
}

export function NoteWelcome({ onCreateNew }: NoteWelcomeProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <NotebookPen className="h-24 w-24 text-muted-foreground/50 mb-6" />
            <h2 className="text-2xl font-semibold mb-2">Welcome to Notes</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
                Select a note from the sidebar to view or edit it, or create a new one to get started.
            </p>
            <Button onClick={onCreateNew}>
                Create a new note
            </Button>
        </div>
    )
}
