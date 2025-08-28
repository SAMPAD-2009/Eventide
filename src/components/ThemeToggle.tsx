"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const themes = ["light", "dark", "system"];
  
  const handleToggle = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getTooltipText = () => {
    switch (theme) {
        case 'light': return 'Switch to Dark Mode';
        case 'dark': return 'Switch to System Preference';
        case 'system': return 'Switch to Light Mode';
        default: return 'Toggle Theme';
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleToggle}>
            <Sun className={"h-[1.2rem] w-[1.2rem] transition-all " + (theme === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0')} />
            <Moon className={"absolute h-[1.2rem] w-[1.2rem] transition-all " + (theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0')} />
            <Laptop className={"absolute h-[1.2rem] w-[1.2rem] transition-all " + (theme === 'system' ? 'rotate-0 scale-100' : 'rotate-90 scale-0')} />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
            <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
