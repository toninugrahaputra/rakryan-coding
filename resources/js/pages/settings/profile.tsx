import { Form, Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { send } from '@/routes/verification';
import SettingsLayout from '@/layouts/settings-layout';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth & {
        user: {
            name: string;
            email: string;
            email_verified_at: string | null;
            username?: string | null;
            avatar_url?: string | null;
            phone?: string | null;
            bio?: string | null;
            school?: string | null;
            major?: string | null;
            grade?: string | null;
            graduation_year?: number | null;
            birth_date?: string | null;
            gender?: string | null;
            city?: string | null;
        }
    };
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;

    // Helper to format date for input field
    const formattedBirthDate = auth.user.birth_date
        ? new Date(auth.user.birth_date).toISOString().split('T')[0]
        : '';

    return (
        <>
            <Head title="Profile Settings — Rakryan Coding" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-10 max-w-2xl font-sans">
                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-10"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* ─── SECTION 1: INFORMASI PROFIL ─── */}
                            <div className="space-y-6">
                                <div className="border-b border-border/50 pb-3">
                                    <h3 className="text-base font-extrabold text-foreground">1. Informasi Profil</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">Identitas utama akun pembelajaranmu.</p>
                                </div>

                                {/* Avatar Upload box (Mock Visual) */}
                                <div className="flex items-center gap-4.5 bg-muted/20 p-4 rounded-2xl border border-border/40">
                                    <div className="h-16 w-16 rounded-full bg-[#B99430] text-white flex items-center justify-center font-extrabold text-xl shadow-inner shrink-0">
                                        {auth.user.name[0]?.toUpperCase()}
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-foreground block">Foto Profil</span>
                                        <span className="text-[10px] text-muted-foreground block">Maksimal 2MB • Format JPG, PNG</span>
                                        <div className="flex gap-2 mt-1">
                                            <Button type="button" size="sm" variant="outline" className="h-7 text-[10px] font-bold rounded-lg">
                                                Unggah foto
                                            </Button>
                                            <Button type="button" size="sm" variant="ghost" className="h-7 text-[10px] font-bold text-destructive hover:bg-destructive/10 rounded-lg">
                                                Hapus
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4.5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nama Lengkap</Label>
                                        <Input
                                            id="name"
                                            className="rounded-xl mt-0.5"
                                            defaultValue={auth.user.name}
                                            name="name"
                                            required
                                            autoComplete="name"
                                            placeholder="Nama lengkap"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            className="rounded-xl mt-0.5"
                                            defaultValue={auth.user.username || ''}
                                            name="username"
                                            placeholder="username_mu"
                                        />
                                        <InputError message={errors.username} />
                                    </div>
                                </div>

                                <div className="grid gap-4.5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative mt-0.5">
                                            <Input
                                                id="email"
                                                type="email"
                                                className="rounded-xl pr-28"
                                                defaultValue={auth.user.email}
                                                name="email"
                                                required
                                                autoComplete="username"
                                                placeholder="Alamat email"
                                            />
                                            {auth.user.email_verified_at ? (
                                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/15 text-[9px] font-bold uppercase rounded px-1.5 py-0.5">
                                                    Terverifikasi
                                                </span>
                                            ) : (
                                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-amber-500/10 text-amber-600 border border-amber-500/15 text-[9px] font-bold uppercase rounded px-1.5 py-0.5">
                                                    Belum Verifikasi
                                                </span>
                                            )}
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">No. HP / WhatsApp</Label>
                                        <Input
                                            id="phone"
                                            className="rounded-xl mt-0.5"
                                            defaultValue={auth.user.phone || ''}
                                            name="phone"
                                            placeholder="Contoh: 0812345678"
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="bio">Bio Singkat</Label>
                                    <textarea
                                        id="bio"
                                        className="flex min-h-[80px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mt-0.5"
                                        defaultValue={auth.user.bio || ''}
                                        name="bio"
                                        placeholder="Ceritakan tentang dirimu..."
                                    />
                                    <InputError message={errors.bio} />
                                </div>

                                {mustVerifyEmail && auth.user.email_verified_at === null && (
                                    <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3.5 text-xs text-amber-800 dark:text-amber-300">
                                        Alamat email kamu belum terverifikasi.{' '}
                                        <Link
                                            href={send()}
                                            as="button"
                                            className="font-bold underline hover:opacity-85"
                                        >
                                            Kirim ulang email verifikasi
                                        </Link>
                                        {status === 'verification-link-sent' && (
                                            <div className="mt-1.5 font-bold text-emerald-600">
                                                Link verifikasi baru telah dikirim ke alamat emailmu.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ─── SECTION 2: DATA SEKOLAH ─── */}
                            <div className="space-y-6 pt-6 border-t border-border/40">
                                <div className="border-b border-border/50 pb-3">
                                    <h3 className="text-base font-extrabold text-foreground">2. Data Sekolah</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">Informasi pendidikan untuk penyesuaian materi belajar.</p>
                                </div>

                                <div className="grid gap-4.5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="school">Nama Sekolah</Label>
                                        <Input
                                            id="school"
                                            className="rounded-xl mt-0.5"
                                            defaultValue={auth.user.school || ''}
                                            name="school"
                                            placeholder="Contoh: SMKN 5 Malang"
                                        />
                                        <InputError message={errors.school} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="major">Jurusan</Label>
                                        <Input
                                            id="major"
                                            className="rounded-xl mt-0.5"
                                            defaultValue={auth.user.major || ''}
                                            name="major"
                                            placeholder="Contoh: Rekayasa Perangkat Lunak (RPL)"
                                        />
                                        <InputError message={errors.major} />
                                    </div>
                                </div>

                                <div className="grid gap-4.5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="grade">Kelas</Label>
                                        <select
                                            id="grade"
                                            name="grade"
                                            defaultValue={auth.user.grade || ''}
                                            className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-0.5"
                                        >
                                            <option value="">Pilih Kelas</option>
                                            <option value="X">Kelas X (10)</option>
                                            <option value="XI">Kelas XI (11)</option>
                                            <option value="XII">Kelas XII (12)</option>
                                            <option value="Lulus">Sudah Lulus</option>
                                        </select>
                                        <InputError message={errors.grade} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="graduation_year">Target Tahun Lulus</Label>
                                        <Input
                                            id="graduation_year"
                                            type="number"
                                            className="rounded-xl mt-0.5"
                                            defaultValue={auth.user.graduation_year || ''}
                                            name="graduation_year"
                                            placeholder="Contoh: 2026"
                                        />
                                        <InputError message={errors.graduation_year} />
                                    </div>
                                </div>
                            </div>

                            {/* ─── SECTION 3: DATA PRIBADI ─── */}
                            <div className="space-y-6 pt-6 border-t border-border/40">
                                <div className="border-b border-border/50 pb-3">
                                    <h3 className="text-base font-extrabold text-foreground">3. Data Pribadi</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">Detail opsional untuk personalisasi profil akun.</p>
                                </div>

                                <div className="grid gap-4.5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="birth_date">Tanggal Lahir</Label>
                                        <Input
                                            id="birth_date"
                                            type="date"
                                            className="rounded-xl mt-0.5"
                                            defaultValue={formattedBirthDate}
                                            name="birth_date"
                                        />
                                        <InputError message={errors.birth_date} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="gender">Jenis Kelamin</Label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            defaultValue={auth.user.gender || ''}
                                            className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-0.5"
                                        >
                                            <option value="">Pilih Gender</option>
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                        <InputError message={errors.gender} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="city">Kota / Domisili</Label>
                                    <Input
                                        id="city"
                                        className="rounded-xl mt-0.5"
                                        defaultValue={auth.user.city || ''}
                                        name="city"
                                        placeholder="Contoh: Malang, Jawa Timur"
                                    />
                                    <InputError message={errors.city} />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center gap-4 pt-6 border-t border-border/40">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                    className="rounded-xl font-bold bg-[#B99430] hover:bg-[#725a15] text-white px-7"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Profil'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <div className="pt-10 border-t border-border/40">
                <DeleteUser />
            </div>
        </>
    );
}

Profile.layout = (page: React.ReactNode) => (
    <SettingsLayout>{page}</SettingsLayout>
);
