import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DashboardStatsProps {
  stats: {
    courses_enrolled: number;
    courses_completed: number;
    member_since: string;
    total_subscriptions: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const completionPercentage = stats.courses_enrolled > 0
    ? Math.round((stats.courses_completed / stats.courses_enrolled) * 100)
    : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Learning Progress</CardTitle>
        <CardDescription className="text-muted-foreground">
          Track your course completion and learning journey
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Courses Enrolled */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Courses Enrolled</span>
            <span className="font-semibold">{stats.courses_enrolled}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{ width: Math.min(100, stats.courses_enrolled * 10) + '%' }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.courses_enrolled} courses enrolled
          </p>
        </div>

        {/* Completed Courses */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Completed Courses</span>
            <span className="font-semibold">{stats.courses_completed}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div
              className="bg-success h-2.5 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {completionPercentage}% completion rate
          </p>
        </div>

        {/* Membership Info */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Member Since</span>
            <span className="font-semibold">
              {new Date(stats.member_since).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Active Subscriptions</span>
            <span className="font-semibold">{stats.total_subscriptions}</span>
          </div>
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