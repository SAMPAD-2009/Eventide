
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HighlightCardProps {
  title: string;
  icon: React.ReactNode;
  value: string;
}

export function HighlightCard({ title, icon, value }: HighlightCardProps) {
  return (
    <Card className="bg-card text-card-foreground shadow-sm rounded-2xl p-4">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex items-center gap-4">
        <div className="text-muted-foreground">{icon}</div>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
