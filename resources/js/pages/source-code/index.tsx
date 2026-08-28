import { Code2 } from 'lucide-react';
import { PublicFooter } from '@/components/public-footer';
import { PublicNavbar } from '@/components/public-navbar';
import { ScrollReveal } from '@/components/scroll-reveal';
import { Seo } from '@/components/seo';
import { SourceCodeCard } from '@/components/source-code-card';
import type { SourceCodeCardData } from '@/components/source-code-card';

interface SourceCodeIndexProps {
    products: SourceCodeCardData[];
}

export default function SourceCodeIndex({ products }: SourceCodeIndexProps) {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <PublicNavbar />

            <main className="flex-1">
                <Seo
                    title="Source Code Project"
                    description="Beli source code project siap pakai dari Rakryan Coding — cocok buat referensi, modifikasi, atau bahan tugas akhir."
                />

                <ScrollReveal animation="slide-right">
                    <section className="bg-muted/40 py-14 sm:py-16">
                        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
                            <p className="text-sm font-semibold tracking-widest text-primary uppercase">
                                Produk Baru
                            </p>
                            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Source Code Project
                            </h1>
                            <p className="mx-auto mt-3 max-w-2xl text-body text-muted-foreground">
                                Source code project siap pakai — cocok buat
                                referensi, modifikasi, atau bahan tugas akhir.
                            </p>
                        </div>
                    </section>
                </ScrollReveal>

                <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
                    {products.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
                            <Code2 className="h-8 w-8 text-muted-foreground" />
                            <p className="text-body-sm font-semibold text-foreground">
                                Belum ada source code project
                            </p>
                            <p className="max-w-md text-body-sm text-muted-foreground">
                                Pantau terus, source code project akan segera
                                hadir di sini.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {products.map((product) => (
                                <SourceCodeCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}
