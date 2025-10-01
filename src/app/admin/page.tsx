import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import { getUserCount } from '@/services/baserow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

async function UserCountCard() {
  let userCount;
  let error;

  try {
    userCount = await getUserCount();
  } catch (e: any) {
    error = e.message || "An unexpected error occurred.";
  }

  if (error) {
    return (
      <Alert variant="destructive" className="sm:col-span-1">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{userCount}</div>
        <p className="text-xs text-muted-foreground">Total registered users in the system</p>
      </CardContent>
    </Card>
  );
}

function UserCountCardSkeleton() {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>
    )
}

export default function AdminPage() {
  return (
    <div className="w-full mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Admin Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Suspense fallback={<UserCountCardSkeleton />}>
                <UserCountCard />
            </Suspense>
        </div>

      </div>
    </div>
  );
}
