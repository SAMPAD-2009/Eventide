
"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Palette, Tags } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { updateUserLandingPage } from '@/services/supabase';
import { LabelSettings } from '@/components/settings/LabelSettings';

const navLinks = [
    { href: "/", label: "Events" },
    { href: "/todo", label: "Todo" },
    { href: "/history", label: "History" },
    { href: "/calendar", label: "Calendar" },
];

export default function SettingsPage() {
    const { user, landingPage, setLandingPage } = useAuth();
    const { toast } = useToast();
    const [selectedSection, setSelectedSection] = useState('landing-page');

    const handleLandingPageChange = async (page: string) => {
        if (user?.email) {
            setLandingPage(page); // Optimistic update
            const { error } = await updateUserLandingPage(user.email, page);
            if (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not save your landing page preference.",
                });
                setLandingPage(landingPage); // Revert on error
            } else {
                toast({
                    title: "Landing Page Set",
                    description: `Your new default page is now ${navLinks.find(l => l.href === page)?.label}.`,
                });
            }
        }
    };

    const renderContent = () => {
        switch (selectedSection) {
            case 'landing-page':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Set Your Landing Page</CardTitle>
                            <CardDescription>
                                Choose which page you want to see first when you open the app.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="max-w-xs space-y-2">
                                <Label htmlFor="landing-page-select">Default Page</Label>
                                <Select value={landingPage} onValueChange={handleLandingPageChange}>
                                    <SelectTrigger id="landing-page-select">
                                        <SelectValue placeholder="Select a page" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {navLinks.map(link => (
                                            <SelectItem key={link.href} value={link.href}>
                                                {link.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                );
            case 'labels':
                return <LabelSettings />;
            default:
                return null;
        }
    }

    return (
        <div className="w-full mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar */}
                <aside className="md:col-span-1">
                    <nav className="flex flex-col space-y-2">
                        <Button asChild variant="outline" className="justify-start">
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to App
                            </Link>
                        </Button>
                        <Button 
                            variant={selectedSection === 'landing-page' ? 'secondary' : 'ghost'} 
                            className="justify-start"
                            onClick={() => setSelectedSection('landing-page')}
                        >
                            <Home className="mr-2 h-4 w-4" /> Landing Page
                        </Button>
                        <Button 
                            variant={selectedSection === 'labels' ? 'secondary' : 'ghost'} 
                            className="justify-start"
                            onClick={() => setSelectedSection('labels')}
                        >
                            <Tags className="mr-2 h-4 w-4" /> Labels
                        </Button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="md:col-span-3">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
