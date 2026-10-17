import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { PartyPopper, ArrowLeft, Sparkles } from 'lucide-react';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-6 md:p-10">
            {/* Background geometric neo-brutalist decorations */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-16 -right-16 size-60 sm:size-80 border-2 border-foreground/15 bg-secondary/30 rotate-12" />
                <div className="absolute -bottom-12 -left-12 size-52 sm:size-72 border-2 border-foreground/15 bg-accent/15 -rotate-6" />
                <div className="absolute top-1/4 -left-8 size-24 border-2 border-foreground/10 bg-primary/10 rotate-45 hidden md:block" />
                <div className="absolute bottom-1/4 -right-6 size-20 border-2 border-foreground/10 bg-secondary/20 -rotate-12 hidden md:block" />
            </div>

            <div className="relative z-10 flex w-full max-w-md flex-col items-center">
                {/* Back to Home Button */}
                {/* <div className="mb-6 flex w-full justify-between items-center">
                    <Link
                        href={home()}
                        className="group inline-flex items-center gap-1.5 border-2 border-foreground bg-card px-3 py-1.5 text-xs sm:text-sm font-bold shadow-xs transition-all hover:-translate-y-0.5 hover:bg-secondary hover:shadow-sm"
                    >
                        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                        <span>Ke Beranda</span>
                    </Link>

                    <span className="inline-flex items-center gap-1 border-2 border-foreground bg-secondary/40 px-2.5 py-1 text-xs font-bold shadow-xs">
                        <Sparkles className="size-3 text-foreground" />
                        eventoria.id
                    </span>
                </div> */}

                {/* Logo & Brand Header */}
                <div className="mb-6 flex flex-col items-center gap-2">
                    <Link
                        href={home()}
                        className="group flex items-center gap-2.5"
                    >
                        <div className="flex size-11 items-center justify-center border-2 border-foreground bg-primary shadow-sm transition-transform group-hover:-translate-y-0.5 group-hover:shadow-md">
                            <PartyPopper className="size-6 text-primary-foreground" />
                        </div>
                        <span className="font-mono text-2xl sm:text-3xl font-black tracking-tight">
                            eventoria.id
                        </span>
                    </Link>
                </div>

                {/* Neo-brutalist Main Card */}
                <div className="relative w-full border-2 border-foreground bg-card p-6 sm:p-8 shadow-lg">
                    {/* Corner accent squares */}
                    <div className="absolute -top-2.5 -left-2.5 size-5 border-2 border-foreground bg-secondary" />
                    <div className="absolute -bottom-2.5 -right-2.5 size-5 border-2 border-foreground bg-accent" />

                    {/* Header */}
                    <div className="mb-6 space-y-1 text-center">
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm font-medium text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Form content */}
                    {children}
                </div>

                {/* Bottom Trust Indicators */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-muted-foreground">
                    <span className="flex items-center gap-1">⚡ 12.500+ Event</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">🎟️ Tiket Instan</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">🛡️ 100% Aman</span>
                </div>
            </div>
        </div>
    );
}
