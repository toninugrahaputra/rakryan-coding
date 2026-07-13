import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { profile } from '@/routes/internal/settings';
import { edit } from '@/routes/profile';
import type { User } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const { currentUrl } = useCurrentUrl();
    const settingsHref = currentUrl.startsWith('/internal') ? profile() : edit();
    const [isOpen, setIsOpen] = useState(false);

    const handleConfirmLogout = () => {
        setIsOpen(false);
        cleanup();
        router.flushAll();
        router.post(logout().url, {}, {
            onFinish: () => {
                window.location.href = '/';
            }
        });
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={settingsHref}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                className="block w-full cursor-pointer text-left text-destructive focus:bg-destructive/10 focus:text-destructive"
                onSelect={(e) => {
                    e.preventDefault();
                    setIsOpen(true);
                }}
                data-test="logout-button"
            >
                <span className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </span>
            </DropdownMenuItem>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Keluar</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin keluar dari akun Anda?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmLogout}>
                            Keluar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
