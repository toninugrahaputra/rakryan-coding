import * as React from 'react';
import { Link as InertiaLink } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface LinkProps extends React.ComponentProps<typeof InertiaLink> {}

export function Link({ className, ...props }: LinkProps) {
  return <InertiaLink className={cn(className)} {...props} />;
}
