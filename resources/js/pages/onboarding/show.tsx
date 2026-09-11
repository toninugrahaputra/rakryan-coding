import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { store } from '@/routes/onboarding';

const INDONESIAN_PROVINCES = [
    'Aceh',
    'Sumatera Utara',
    'Sumatera Barat',
    'Riau',
    'Kepulauan Riau',
    'Jambi',
    'Bengkulu',
    'Sumatera Selatan',
    'Kepulauan Bangka Belitung',
    'Lampung',
    'DKI Jakarta',
    'Jawa Barat',
    'Banten',
    'Jawa Tengah',
    'DI Yogyakarta',
    'Jawa Timur',
    'Bali',
    'Nusa Tenggara Barat',
    'Nusa Tenggara Timur',
    'Kalimantan Barat',
    'Kalimantan Tengah',
    'Kalimantan Selatan',
    'Kalimantan Timur',
    'Kalimantan Utara',
    'Sulawesi Utara',
    'Gorontalo',
    'Sulawesi Tengah',
    'Sulawesi Barat',
    'Sulawesi Selatan',
    'Sulawesi Tenggara',
    'Maluku',
    'Maluku Utara',
    'Papua',
    'Papua Barat',
    'Papua Barat Daya',
    'Papua Tengah',
    'Papua Pegunungan',
    'Papua Selatan',
    'Luar Negeri',
];

const INFO_SOURCES = [
    'Instagram',
    'TikTok',
    'YouTube',
    'Google / Pencarian',
    'Teman / Rekomendasi',
    'Lainnya',
];

const STATUS_OPTIONS = [
    { value: 'school', label: 'Sedang Sekolah / Kuliah' },
    { value: 'working', label: 'Sedang Kerja' },
    { value: 'other', label: 'Lainnya' },
];

export default function OnboardingShow() {
    return (
        <>
            <Head title="Lengkapi Data Diri" />

            <Form {...store.form()} className="space-y-5">
                {({ errors, processing }) => (
                    <>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="region">Asal Wilayah</Label>
                            <Select name="region" defaultValue="">
                                <SelectTrigger id="region">
                                    <SelectValue placeholder="Pilih provinsi domisili kamu" />
                                </SelectTrigger>
                                <SelectContent>
                                    {INDONESIAN_PROVINCES.map((province) => (
                                        <SelectItem
                                            key={province}
                                            value={province}
                                        >
                                            {province}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.region} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="info_source">
                                Dari Mana Tahu Rakryan Coding?
                            </Label>
                            <Select name="info_source" defaultValue="">
                                <SelectTrigger id="info_source">
                                    <SelectValue placeholder="Pilih salah satu" />
                                </SelectTrigger>
                                <SelectContent>
                                    {INFO_SOURCES.map((source) => (
                                        <SelectItem key={source} value={source}>
                                            {source}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.info_source} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="status">Status Kamu Saat Ini</Label>
                            <Select name="status" defaultValue="">
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Pilih status kamu" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((status) => (
                                        <SelectItem
                                            key={status.value}
                                            value={status.value}
                                        >
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="additional_notes">
                                Ada Tambahan yang Mau Disampaikan?{' '}
                                <span className="font-normal text-muted-foreground">
                                    (opsional)
                                </span>
                            </Label>
                            <textarea
                                id="additional_notes"
                                name="additional_notes"
                                rows={3}
                                placeholder="Misalnya harapan, kritik, atau saran buat Rakryan Coding..."
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <InputError message={errors.additional_notes} />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            Lanjutkan
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

OnboardingShow.layout = {
    title: 'Lengkapi Data Diri',
    description:
        'Sebelum mulai belajar, ceritakan sedikit tentang dirimu — cuma sekali ini aja, kok.',
};
