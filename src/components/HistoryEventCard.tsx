
"use client"

import { memo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HistoryEvent {
  year: number;
  description: string;
  picture: string;
}

interface HistoryEventCardProps {
    event: HistoryEvent;
}

export const HistoryEventCard = memo(function HistoryEventCard({ event }: HistoryEventCardProps) {

  return (
    <Card className="flex flex-col overflow-hidden">
        {event.picture && (
             <div className="relative w-full h-48">
                <Image
                    src={event.picture}
                    alt={event.description}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                    className="bg-muted"
                />
            </div>
        )}
      <CardHeader>
        <CardTitle>Year: {event.year}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{event.description}</p>
      </CardContent>
    </Card>
  );
});

    