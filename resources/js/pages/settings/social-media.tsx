import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { edit as editSocialMedia } from '@/routes/social-media';
import {
    SUPPORTED_PLATFORMS,
    SocialIcon,
    getPlatformMeta,
    type PlatformId,
} from '@/components/social-media-icon';
import type { Auth } from '@/types';
import {
    Plus,
    Trash2,
    ExternalLink,
    Share2,
    Sparkles,
    CheckCircle2,
    Eye,
    Globe,
    AlertCircle,
} from 'lucide-react';

export type SocialMediaItem = {
    id: string;
    platform: string;
    url: string;
    handle?: string | null;
};

type Props = {
    socialMedia: SocialMediaItem[];
    status?: string;
};

type PageProps = {
    auth: Auth;
};

export default function SocialMediaSettings({ socialMedia: initialSocialMedia = [] }: Props) {
    const { auth } = usePage<PageProps>().props;
    const [items, setItems] = useState<SocialMediaItem[]>(() => {
        return (initialSocialMedia || []).map((item, idx) => ({
            id: item.id || `sm_${Date.now()}_${idx}`,
            platform: item.platform || 'instagram',
            url: item.url || '',
            handle: item.handle || '',
        }));
    });

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedQuickAdd, setSelectedQuickAdd] = useState<string>('instagram');

    // Handle adding a new social media entry
    const handleAddPlatform = (platformId: string) => {
        const meta = getPlatformMeta(platformId);
        const newItem: SocialMediaItem = {
            id: `sm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            platform: platformId,
            url: '',
            handle: '',
        };
        setItems((prev) => [...prev, newItem]);
    };

    // Handle removing an entry
    const handleRemove = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    // Handle changing field of an item
    const handleChange = (id: string, field: 'platform' | 'url' | 'handle', value: string) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    return { ...item, [field]: value };
                }
                return item;
            }),
        );
    };

    // Save changes
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        // Filter out empty items where url is empty
        const cleanedItems = items.filter((item) => item.url.trim() !== '');

        router.patch(
            '/settings/social-media',
            { social_media: cleanedItems },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setProcessing(false);
                },
                onError: (err) => {
                    setProcessing(false);
                    setErrors(err);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    // Format url for preview / test
    const getResolvedUrl = (item: SocialMediaItem) => {
        const raw = (item.url || '').trim();
        if (!raw) return '#';
        if (/^(?:f|ht)tps?:\/\//i.test(raw)) return raw;

        if (item.platform === 'whatsapp') {
            const phone = raw.replace(/[^0-9]/g, '');
            const normalized = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
            return `https://wa.me/${normalized}`;
        }

        if (raw.startsWith('@')) {
            const username = raw.slice(1);
            switch (item.platform) {
                case 'instagram':
                    return `https://instagram.com/${username}`;
                case 'tiktok':
                    return `https://tiktok.com/@${username}`;
                case 'twitter':
                    return `https://x.com/${username}`;
                case 'facebook':
                    return `https://facebook.com/${username}`;
                case 'youtube':
                    return `https://youtube.com/@${username}`;
                case 'github':
                    return `https://github.com/${username}`;
                case 'telegram':
                    return `https://t.me/${username}`;
                default:
                    return `https://${username}`;
            }
        }

        return `https://${raw}`;
    };

    return (
        <>
            <Head title="Pengaturan Media Sosial Vendor" />

            <h1 className="sr-only">Pengaturan Media Sosial Vendor</h1>

            <div className="space-y-8">
                {/* ───── HEADER ───── */}
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        {/* <Badge variant="outline" className="border-2 border-foreground font-black uppercase shadow-xs">
                            Vendor Profile
                        </Badge>
                        <span className="text-xs text-muted-foreground font-medium">Pengaturan Tautan Publik</span> */}
                    </div>
                    <Heading
                        variant="small"
                        title="Media Sosial Vendor"
                        description="Pilih dan atur media sosial apa saja yang ingin Anda tampilkan pada profil vendor Anda agar calon klien dan peserta event dapat dengan mudah menghubungi atau melihat portofolio Anda."
                    />
                </div>

                {/* ───── BANNER LINK TO PUBLIC PROFILE ───── */}
                <div className="flex flex-col gap-3 rounded-lg border-2 border-foreground bg-secondary/20 p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border-2 border-foreground bg-primary/20 shadow-xs">
                            <Globe className="size-4" />
                        </div>
                        <div>
                            <div className="text-sm font-bold">Profil Publik Vendor Anda</div>
                            <div className="text-xs text-muted-foreground font-mono">
                                eventoria.id/{auth.user.username}
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-2 border-foreground font-bold shadow-xs active:translate-x-0.5 active:translate-y-0.5"
                    >
                        <Link href={`/${auth.user.username}`} target="_blank">
                            <ExternalLink className="mr-1.5 size-3.5" />
                            Lihat Profil
                        </Link>
                    </Button>
                </div>

                {/* ───── FORM ───── */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ───── QUICK ADD PLATFORM SELECTOR ───── */}
                    <div className="rounded-lg border-2 border-foreground bg-card p-5 shadow-sm space-y-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-bold flex items-center gap-2">
                                    <Sparkles className="size-4 text-primary" />
                                    Pilih Media Sosial untuk Ditambahkan
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Klik platform di bawah untuk menambahkannya ke daftar tautan profil Anda
                                </p>
                            </div>
                        </div>

                        {/* Quick platform chips */}
                        <div className="flex flex-wrap gap-2 pt-1">
                            {SUPPORTED_PLATFORMS.map((platform) => {
                                const isAdded = items.some((item) => item.platform === platform.id);
                                return (
                                    <Button
                                        key={platform.id}
                                        type="button"
                                        size="sm"
                                        variant={isAdded ? 'secondary' : 'outline'}
                                        onClick={() => handleAddPlatform(platform.id)}
                                        className={`border-2 border-foreground font-bold text-xs gap-2 transition-transform active:translate-x-0.5 active:translate-y-0.5 shadow-xs ${
                                            isAdded ? 'bg-primary/15 hover:bg-primary/25' : 'hover:bg-accent'
                                        }`}
                                    >
                                        <SocialIcon platform={platform.id} className="size-3.5" />
                                        {platform.label}
                                        {isAdded ? (
                                            <span className="flex size-4 items-center justify-center rounded-full bg-foreground text-background text-[10px]">
                                                ✓
                                            </span>
                                        ) : (
                                            <Plus className="size-3 text-muted-foreground" />
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ───── ACTIVE SOCIAL MEDIA ITEMS ───── */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                Daftar Media Sosial yang Ditampilkan ({items.length})
                            </h2>
                            {/* {items.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                    Tombol akan otomatis muncul pada profil vendor
                                </span>
                            )} */}
                        </div>

                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-foreground/30 p-8 text-center bg-card">
                                <div className="mb-3 flex size-12 items-center justify-center rounded-full border-2 border-foreground/30 bg-muted">
                                    <Share2 className="size-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-sm font-bold">Belum Ada Media Sosial yang Dipilih</h3>
                                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                                    Pilih media sosial dari tombol di atas seperti Instagram, WhatsApp, atau TikTok agar pengunjung profil dapat langsung menghubungi Anda.
                                </p>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => handleAddPlatform('instagram')}
                                    className="mt-4 border-2 border-foreground font-bold shadow-xs active:translate-x-0.5 active:translate-y-0.5"
                                >
                                    <Plus className="mr-1.5 size-4" />
                                    Tambah Instagram
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item, index) => {
                                    const meta = getPlatformMeta(item.platform);
                                    const testUrl = getResolvedUrl(item);

                                    return (
                                        <div
                                            key={item.id}
                                            className="group relative rounded-lg border-2 border-foreground bg-card p-4 shadow-xs transition-shadow hover:shadow-sm"
                                        >
                                            <div className="flex flex-col gap-3">
                                                {/* Header row: Platform Selector & Delete */}
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2 flex-1 max-w-xs">
                                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md border-2 border-foreground bg-secondary/50 shadow-xs">
                                                            <SocialIcon platform={item.platform} className="size-4" />
                                                        </div>
                                                        <Select
                                                            value={item.platform}
                                                            onValueChange={(val) => handleChange(item.id, 'platform', val)}
                                                        >
                                                            <SelectTrigger className="h-9 border-2 border-foreground font-bold shadow-xs">
                                                                <SelectValue placeholder="Pilih Platform" />
                                                            </SelectTrigger>
                                                            <SelectContent className="border-2 border-foreground font-medium">
                                                                {SUPPORTED_PLATFORMS.map((p) => (
                                                                    <SelectItem key={p.id} value={p.id}>
                                                                        <div className="flex items-center gap-2">
                                                                            <SocialIcon platform={p.id} className="size-3.5" />
                                                                            <span>{p.label}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        {item.url && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                asChild
                                                                className="h-8 gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                                                            >
                                                                <a href={testUrl} target="_blank" rel="noopener noreferrer">
                                                                    <ExternalLink className="size-3.5" />
                                                                    <span className="hidden sm:inline">Uji Link</span>
                                                                </a>
                                                            </Button>
                                                        )}

                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemove(item.id)}
                                                            className="size-8 text-destructive hover:bg-destructive/10"
                                                            title="Hapus media sosial ini"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Input row: URL and Handle */}
                                                <div className="grid gap-3 sm:grid-cols-12">
                                                    <div className="sm:col-span-8">
                                                        <Label className="text-xs font-bold text-muted-foreground">
                                                            Link URL / Username <span className="text-destructive">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            value={item.url}
                                                            onChange={(e) => handleChange(item.id, 'url', e.target.value)}
                                                            placeholder={meta.placeholder}
                                                            className="mt-1 border-2 border-foreground shadow-xs font-mono text-sm"
                                                            required
                                                        />
                                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                                            {meta.hint}
                                                        </p>
                                                    </div>

                                                    <div className="sm:col-span-4">
                                                        <Label className="text-xs font-bold text-muted-foreground">
                                                            Teks Tombol (Opsional)
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            value={item.handle || ''}
                                                            onChange={(e) => handleChange(item.id, 'handle', e.target.value)}
                                                            placeholder={meta.label}
                                                            className="mt-1 border-2 border-foreground shadow-xs text-sm"
                                                        />
                                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                                            Default: {meta.label}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ───── LIVE PREVIEW CARD ───── */}
                    <div className="rounded-lg border-2 border-foreground bg-secondary/10 p-5 shadow-xs space-y-3">
                        <div className="flex items-center gap-2">
                            <Eye className="size-4 text-foreground" />
                            <h3 className="text-sm font-bold">Pratinjau Tombol di Profil Publik</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Berikut tampilan tombol media sosial yang akan menggantikan tombol "Hubungi" dan "Ikuti" pada profil vendor Anda:
                        </p>

                        <div className="flex flex-wrap items-center gap-2 rounded-md border-2 border-dashed border-foreground/30 bg-background p-4">
                            {items.length === 0 ? (
                                <span className="text-xs italic text-muted-foreground">
                                    Belum ada tombol media sosial yang ditambahkan.
                                </span>
                            ) : (
                                items.map((item) => {
                                    const meta = getPlatformMeta(item.platform);
                                    const label = item.handle?.trim() || meta.label;
                                    return (
                                        <Button
                                            key={item.id}
                                            type="button"
                                            variant="outline"
                                            className="border-2 border-foreground font-bold shadow-xs hover:bg-secondary/40 active:translate-x-0.5 active:translate-y-0.5"
                                        >
                                            <SocialIcon platform={item.platform} className="size-4" />
                                            {label}
                                        </Button>
                                    );
                                })
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="border-2 border-foreground shadow-xs"
                                title="Tombol Share tetap dipertahankan"
                            >
                                <Share2 className="size-4" />
                            </Button>
                        </div>
                    </div>

                    {/* ───── SUBMIT ACTIONS ───── */}
                    {errors.social_media && (
                        <div className="rounded-md border-2 border-destructive bg-destructive/10 p-3 text-xs text-destructive font-medium flex items-center gap-2">
                            <AlertCircle className="size-4 shrink-0" />
                            {errors.social_media}
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="border-2 border-foreground font-bold shadow-sm active:translate-x-0.5 active:translate-y-0.5"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Media Sosial'}
                        </Button>

                        {/* <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleAddPlatform('website')}
                            className="border-2 border-foreground font-bold shadow-xs"
                        >
                            <Plus className="mr-1.5 size-4" />
                            Tambah Tautan Lain
                        </Button> */}
                    </div>
                </form>
            </div>
        </>
    );
}

SocialMediaSettings.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan Media Sosial',
            href: editSocialMedia(),
        },
    ],
};
