import { UserInfo } from "@/components/user-info";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface UserProfileCardProps {
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    created_at: string;
  };
  stats: {
    courses_enrolled: number;
    courses_completed: number;
    member_since: string;
    total_subscriptions: number;
  };
}

export function UserProfileCard({ user, stats }: UserProfileCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="mb-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12">
            <UserInfo user={{ ...user, avatar: user.avatar ?? undefined }} showEmail={false} />
          </div>
          <div>
            <h2 className="font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
          <div className="text-muted-foreground text-xs">Courses Enrolled</div>
          <div className="font-semibold">{stats.courses_enrolled}</div>
        </div>
        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
          <div className="text-muted-foreground text-xs">Completed</div>
          <div className="font-semibold">{stats.courses_completed}</div>
        </div>
        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
          <div className="text-muted-foreground text-xs">Subscriptions</div>
          <div className="font-semibold">{stats.total_subscriptions}</div>
        </div>
        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
          <div className="text-muted-foreground text-xs">Member Since</div>
          <div className="font-semibold text-xs">{new Date(stats.member_since).toLocaleDateString()}</div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button variant="outline" size="sm" asChild>
          <a href="/profile/edit">Edit Profile</a>
        </Button>
      </CardFooter>
    </Card>
  );
}