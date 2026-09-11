export type Onboarding = {
    region: string | null;
    info_source: string | null;
    status: string | null;
    additional_notes: string | null;
    onboarded_at: string | null;
};

export const ONBOARDING_STATUS_LABELS: Record<string, string> = {
    school: 'Sedang Sekolah / Kuliah',
    working: 'Sedang Kerja',
    other: 'Lainnya',
};
