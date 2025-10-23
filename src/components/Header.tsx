
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, LogOut, Menu, CalendarDays, CloudSun, Settings, ListTodo, History, Home, Notebook, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { generateAvatar } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import React from 'react';


export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isSheetOpen, setSheetOpen] = React.useState(false);

  const navLinks = [
    { href: "/", label: "Events", mobileLabel: "Events", icon: Home },
    { href: "/todo", label: "Todo", mobileLabel: "Todo", icon: ListTodo },
    { href: "/notes", label: "Notes", mobileLabel: "Notes", icon: Notebook },
    { href: "/collab", label: "Collaborate", mobileLabel: "Collaborate", icon: Users },
    { href: "/history", label: "History", mobileLabel: "History", icon: History },
  ];

  const navLinkClasses = (path: string) =>
    cn(
      "transition-colors hover:text-primary",
      pathname === path ? "text-primary font-semibold" : "text-muted-foreground"
    );

  const handleLinkClick = () => {
    setSheetOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex gap-6 md:gap-10 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold text-lg">Eventide</span>
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className={navLinkClasses(link.href)} prefetch={true}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
            <ThemeToggle />

            {user && (
                <Button asChild variant="ghost" size="icon">
                    <Link href="/settings">
                        <Settings />
                        <span className="sr-only">Settings</span>
                    </Link>
                </Button>
            )}

            {user ? (
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
                            <AvatarFallback>{generateAvatar(user.email ?? '')}</AvatarFallback>
                        </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName ?? 'My Account'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                       <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <div className="hidden md:flex items-center gap-2">
                    <Button asChild variant="ghost">
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </div>
            )}
             <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>
                    Main navigation links for the Eventide application.
                  </SheetDescription>
                </SheetHeader>
                <nav className="grid gap-6 text-lg font-medium mt-8">
                  {navLinks.map(link => (
                    <Link 
                      key={`mobile-${link.href}`}
                      href={link.href} 
                      className={cn("flex items-center gap-4", navLinkClasses(link.href))}
                      onClick={handleLinkClick}
                      prefetch={true}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.mobileLabel}
                    </Link>
                  ))}
                  <DropdownMenuSeparator />
                  {!user && (
                    <>
                      <Link href="/login" className={navLinkClasses("/login")} onClick={handleLinkClick}>Login</Link>
                      <Link href="/signup" className={navLinkClasses("/signup")} onClick={handleLinkClick}>Sign Up</Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
