import { Link } from '@inertiajs/react';
import { Bell, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import {
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { index as notificationsIndex } from '@/routes/notifications';
import { edit as profileEdit } from '@/routes/profile';
import { edit as securityEdit } from '@/routes/security';
import type { User } from '@/types';

type Props = {
    user: User;
    unreadNotificationsCount?: number;
    onLogoutClick: () => void;
};

/** Isi dropdown akun di navbar publik — dipakai di dalam DropdownMenuContent. Dashboard/Pesanan/Voucher sudah tampil sebagai tombol langsung di navbar, jadi tidak diulang di sini. */
export function PublicUserMenu({
    user,
    unreadNotificationsCount = 0,
    onLogoutClick,
}: Props) {
    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
                <Link href={notificationsIndex()} className="cursor-pointer">
                    <Bell className="h-4 w-4" />
                    Notifikasi
                    {unreadNotificationsCount > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                            {unreadNotificationsCount}
                        </span>
                    )}
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href={profileEdit()} className="cursor-pointer">
                    <UserRound className="h-4 w-4" />
                    Profil Saya
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href={securityEdit()} className="cursor-pointer">
                    <ShieldCheck className="h-4 w-4" />
                    Keamanan
                </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer font-bold"
                onSelect={(e) => {
                    e.preventDefault();
                    onLogoutClick();
                }}
            >
                <LogOut className="h-4 w-4" />
                Keluar
            </DropdownMenuItem>
        </>
    );
}
