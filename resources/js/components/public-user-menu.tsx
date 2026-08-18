import { Link } from '@inertiajs/react';
import { LogOut, ShieldCheck, UserRound } from 'lucide-react';
import {
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { edit as profileEdit } from '@/routes/profile';
import { edit as securityEdit } from '@/routes/security';
import type { User } from '@/types';

type Props = {
    user: User;
    onLogoutClick: () => void;
};

/**
 * Isi dropdown akun di navbar publik — dipakai di dalam DropdownMenuContent.
 * Dashboard/Pesanan/Voucher sudah tampil sebagai menu langsung di navbar, dan
 * Notifikasi punya ikon loncengnya sendiri di sana, jadi tidak diulang di sini.
 */
export function PublicUserMenu({ user, onLogoutClick }: Props) {
    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

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
