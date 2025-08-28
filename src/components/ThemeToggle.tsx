
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const handleToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const getTooltipText = () => {
    return theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleToggle}>
            <Sun className={"h-[1.2rem] w-[1.2rem] transition-all " + (theme === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0')} />
            <Moon className={"absolute h-[1.2rem] w-[1.2rem] transition-all " + (theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0')} />
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
