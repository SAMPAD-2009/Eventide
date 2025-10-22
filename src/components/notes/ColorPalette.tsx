
"use client";

import { type Editor } from '@tiptap/react'
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface ColorPaletteProps {
    editor: Editor;
}

const TEXT_COLORS = [
    { name: 'Default', color: '#000000', forDark: '#FFFFFF' },
    { name: 'Grey', color: '#808080' },
    { name: 'Brown', color: '#A52A2A' },
    { name: 'Orange', color: '#FFA500' },
    { name: 'Yellow', color: '#FFFF00' },
    { name: 'Green', color: '#008000' },
    { name: 'Blue', color: '#0000FF' },
    { name: 'Purple', color: '#800080' },
    { name: 'Red', color: '#FF0000' },
]

const HIGHLIGHT_COLORS = [
    { name: 'Default', color: 'transparent' },
    { name: 'Light Grey', color: '#D3D3D3' },
    { name: 'Light Brown', color: '#F5DEB3' },
    { name: 'Light Orange', color: '#FFE4B5' },
    { name: 'Light Yellow', color: '#FFFFE0' },
    { name: 'Light Green', color: '#90EE90' },
    { name: 'Light Blue', color: '#ADD8E6' },
    { name: 'Light Purple', color: '#E6E6FA' },
    { name: 'Light Red', color: '#F08080' },
]

export function ColorPalette({ editor }: ColorPaletteProps) {
    
    const handleSetColor = (color: string) => {
        editor.chain().focus().setColor(color).run()
    }

    const handleSetHighlight = (color: string) => {
        editor.chain().focus().toggleHighlight({ color }).run()
    }

    return (
        <div className="p-2 space-y-4">
            <div>
                <h3 className="text-sm font-medium mb-2">Text Color</h3>
                <div className="grid grid-cols-5 gap-2">
                    {TEXT_COLORS.map(({ name, color, forDark }) => {
                        const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
                        const effectiveColor = theme === 'dark' && forDark ? forDark : color;
                        return (
                            <Button
                                key={name}
                                onClick={() => handleSetColor(effectiveColor)}
                                variant="outline"
                                size="icon"
                                title={name}
                                className={cn(
                                    "rounded-full h-8 w-8",
                                    editor.isActive('textStyle', { color: effectiveColor }) && "ring-2 ring-ring"
                                )}
                            >
                               <div className="rounded-full w-6 h-6 border" style={{ backgroundColor: effectiveColor }}/>
                            </Button>
                        )
                    })}
                </div>
            </div>
            <div>
                <h3 className="text-sm font-medium mb-2">Highlight Color</h3>
                <div className="grid grid-cols-5 gap-2">
                    {HIGHLIGHT_COLORS.map(({ name, color }) => (
                         <Button
                            key={name}
                            onClick={() => handleSetHighlight(color)}
                            variant="outline"
                            size="icon"
                            title={name}
                            className={cn(
                                "rounded-full h-8 w-8",
                                editor.isActive('highlight', { color: color }) && "ring-2 ring-ring"
                            )}
                        >
                            <div className="rounded-full w-6 h-6 border" style={{ backgroundColor: color }}/>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
}
