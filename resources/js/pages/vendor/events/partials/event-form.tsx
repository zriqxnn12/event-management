import { useState, useId } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import InputError from '@/components/input-error';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertCircle,
    CalendarDays,
    MapPin,
    Monitor,
    Plus,
    Trash2,
    Ticket,
    Tag,
    Users,
    Mic,
    Building2,
    X,
    Save,
    Send,
    Lock,
    Unlock,
    ExternalLink,
    Sparkles,
    Check,
    ArrowLeft,
    ArrowRight,
    Image as ImageIcon,
    Clock,
    FileText,
} from 'lucide-react';
import type {
    TicketRow,
    CouponRow,
    AgendaRow,
    SpeakerRow,
    SponsorRow,
    EventFormData,
    EventFormProps as Props,
} from '@/types';
export type { TicketRow, CouponRow, AgendaRow, SpeakerRow, SponsorRow, EventFormData, Props as EventFormProps };

// ─── Constants ───────────────────────────────────────────────────────────────

const EVENT_CATEGORIES = [
    'Musik', 'Seni & Budaya', 'Edukasi', 'Teknologi', 'Bisnis & Networking',
    'Olahraga', 'Festival', 'Workshop', 'Konferensi', 'Webinar', 'Amal & Sosial',
    'Hiburan', 'Kuliner', 'Pernikahan & MICE', 'Lainnya',
];

const ONLINE_PLATFORMS = [
    'Zoom', 'Google Meet', 'Microsoft Teams', 'YouTube Live', 'Instagram Live',
    'TikTok Live', 'Webex', 'Discord', 'Lainnya',
];

const SPONSOR_TIERS = [
    { value: 'platinum', label: 'Platinum', color: 'bg-sky-100 text-sky-800 border-sky-300' },
    { value: 'gold', label: 'Gold', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { value: 'silver', label: 'Silver', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { value: 'bronze', label: 'Bronze', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { value: 'partner', label: 'Partner', color: 'bg-violet-100 text-violet-700 border-violet-300' },
];

const STEPS = [
    {
        id: 1,
        title: 'Informasi Dasar',
        shortTitle: 'Info Dasar',
        description: 'Judul, kategori, tipe, status, & banner event',
        icon: Sparkles,
        fields: ['title', 'description', 'category', 'type', 'status', 'max_attendees', 'tags', 'cover_image'],
    },
    {
        id: 2,
        title: 'Tanggal & Waktu',
        shortTitle: 'Jadwal',
        description: 'Jadwal pelaksanaan & batas pendaftaran',
        icon: CalendarDays,
        fields: ['start_date', 'end_date', 'registration_start', 'registration_end'],
    },
    {
        id: 3,
        title: 'Lokasi & Akses',
        shortTitle: 'Lokasi',
        description: 'Tempat fisik atau link online meeting',
        icon: MapPin,
        fields: ['location_name', 'location_maps_url', 'location_address', 'online_platform', 'online_url', 'online_url_password'],
    },
    {
        id: 4,
        title: 'Tiket & Kupon Promo',
        shortTitle: 'Tiket & Promo',
        description: 'Kategori tiket masuk & kode kupon diskon',
        icon: Ticket,
        fields: ['tickets', 'coupons'],
    },
    {
        id: 5,
        title: 'Agenda & Pengisi Acara',
        shortTitle: 'Agenda & Mitra',
        description: 'Rundown sesi, pembicara, & sponsor acara',
        icon: Users,
        fields: ['agendas', 'speakers', 'sponsors'],
    },
] as const;

const uid = () => `_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const defaultTicket = (): TicketRow => ({
    _key: uid(), name: '', description: '', type: 'free', price: '',
    quota: '', sale_start: '', sale_end: '', perks: [], is_active: true,
});

const defaultCoupon = (): CouponRow => ({
    _key: uid(), code: '', description: '', discount_type: 'percentage',
    discount_value: '', max_discount_amount: '', max_uses: '', max_uses_per_user: '1',
    minimum_purchase: '', valid_from: '', valid_until: '', is_active: true,
});

const defaultAgenda = (): AgendaRow => ({
    _key: uid(), title: '', description: '', start_time: '', end_time: '',
    speaker_name: '', date: '',
});

const defaultSpeaker = (): SpeakerRow => ({
    _key: uid(), name: '', title: '', company: '', bio: '',
    avatar: null, linkedin_url: '', twitter_url: '',
});

const defaultSponsor = (): SponsorRow => ({
    _key: uid(), name: '', logo: null, website_url: '', tier: 'partner',
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EventForm({
    initialData = {},
    action,
    method,
    submitLabel = 'Simpan Event',
    existingCoverImage,
}: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    const [tagInput, setTagInput] = useState('');
    const [perkInputs, setPerkInputs] = useState<Record<string, string>>({});
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const { data, setData, submit, processing, errors, transform } = useForm<EventFormData>({
        title: '',
        description: '',
        category: '',
        type: 'offline',
        status: 'draft',
        start_date: '',
        end_date: '',
        registration_start: '',
        registration_end: '',
        max_attendees: '',
        location_name: '',
        location_address: '',
        location_maps_url: '',
        online_platform: '',
        online_url: '',
        online_url_protected: false,
        online_url_password: '',
        cover_image: null,
        tags: [],
        tickets: [],
        coupons: [],
        agendas: [],
        speakers: [],
        sponsors: [],
        ...initialData,
    });

    const getStepErrorCount = (stepId: number): number => {
        const errorKeys = Object.keys(errors);
        if (errorKeys.length === 0) return 0;

        const step = STEPS.find((s) => s.id === stepId);
        if (!step) return 0;

        return errorKeys.filter((key) => {
            return step.fields.some((field) => key === field || key.startsWith(`${field}.`));
        }).length;
    };

    const handleSubmit = (e?: React.FormEvent, statusOverride?: EventFormData['status']) => {
        if (e) {
            e.preventDefault();
        }

        const effectiveStatus = statusOverride ?? data.status;
        setData('status', effectiveStatus);

        transform((currData) => ({
            ...currData,
            status: effectiveStatus,
            ...(method === 'put' || method === 'patch' ? { _method: method } : {}),
        }));

        const submitMethod = method === 'put' || method === 'patch' ? 'post' : method;

        submit(submitMethod, action, {
            forceFormData: true,
            onError: (errs) => {
                const keys = Object.keys(errs);
                if (keys.length > 0) {
                    // Cari step pertama yang mengandung error dan otomatis lompat ke sana
                    for (const step of STEPS) {
                        const hasErr = keys.some((k) =>
                            step.fields.some((f) => k === f || k.startsWith(`${f}.`))
                        );
                        if (hasErr) {
                            setCurrentStep(step.id);
                            break;
                        }
                    }

                    toast.error(
                        keys.length === 1
                            ? errs[keys[0]]
                            : `Terdapat ${keys.length} kesalahan validasi. Silakan periksa kolom yang ditandai merah.`
                    );
                }
            },
        });
    };

    // ── Tag helpers ──
    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !data.tags.includes(tag)) {
            setData('tags', [...data.tags, tag]);
        }
        setTagInput('');
    };

    const removeTag = (tag: string) => setData('tags', data.tags.filter((t) => t !== tag));

    // ── Ticket helpers ──
    const updateTicket = <K extends keyof TicketRow>(key: string, field: K, value: TicketRow[K]) => {
        setData('tickets', data.tickets.map((t) => (t._key === key ? { ...t, [field]: value } : t)));
    };

    const addPerk = (ticketKey: string) => {
        const perk = (perkInputs[ticketKey] || '').trim();
        if (!perk) return;
        setData('tickets', data.tickets.map((t) =>
            t._key === ticketKey ? { ...t, perks: [...t.perks, perk] } : t
        ));
        setPerkInputs((p) => ({ ...p, [ticketKey]: '' }));
    };

    const removePerk = (ticketKey: string, perkIdx: number) => {
        setData('tickets', data.tickets.map((t) =>
            t._key === ticketKey ? { ...t, perks: t.perks.filter((_, i) => i !== perkIdx) } : t
        ));
    };

    // ── Generic list helpers ──
    const updateItem = <T,>(field: keyof EventFormData, key: string, patch: Partial<T>) => {
        setData(field, (((data[field] as unknown as (T & { _key: string })[]) || []).map((item) =>
            item._key === key ? { ...item, ...patch } : item
        ) as unknown as EventFormData[typeof field]));
    };

    const removeItem = (field: keyof EventFormData, key: string) => {
        setData(field, (((data[field] as unknown as { _key: string }[]) || []).filter((i) => i._key !== key) as unknown as EventFormData[typeof field]));
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('cover_image', file);
        if (file) {
            setCoverPreview(URL.createObjectURL(file));
        } else {
            setCoverPreview(null);
        }
    };

    const isOffline = data.type === 'offline' || data.type === 'hybrid';
    const isOnline = data.type === 'online' || data.type === 'hybrid';

    const activeStepMeta = STEPS.find((s) => s.id === currentStep) || STEPS[0];
    const totalSteps = STEPS.length;
    const progressPercent = Math.round((currentStep / totalSteps) * 100);

    return (
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="flex flex-col gap-6">
            <input type="hidden" name="status" value={data.status} />
            {(method === 'put' || method === 'patch') && <input type="hidden" name="_method" value={method} />}

            {/* ── Top Stepper Navigation ── */}
            <div className="border-2 border-foreground bg-card shadow-xs">
                {/* Stepper Tabs */}
                <div className="grid grid-cols-2 divide-y-2 divide-foreground border-b-2 border-foreground sm:grid-cols-5 sm:divide-x-2 sm:divide-y-0">
                    {STEPS.map((step) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isDone = currentStep > step.id;
                        const errCount = getStepErrorCount(step.id);

                        return (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => setCurrentStep(step.id)}
                                className={`group relative flex items-center gap-3 p-3 text-left transition-all sm:flex-col sm:items-start sm:p-4 ${
                                    isActive
                                        ? 'bg-secondary/40 font-bold'
                                        : 'bg-background hover:bg-muted/40'
                                }`}
                            >
                                <div className="flex w-full items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`flex size-7 items-center justify-center border-2 text-xs font-black transition-all ${
                                                errCount > 0
                                                    ? 'border-destructive bg-destructive text-destructive-foreground'
                                                    : isActive
                                                      ? 'border-foreground bg-primary text-primary-foreground shadow-2xs'
                                                      : isDone
                                                        ? 'border-foreground bg-foreground text-background'
                                                        : 'border-foreground/30 text-muted-foreground'
                                            }`}
                                        >
                                            {errCount > 0 ? (
                                                <AlertCircle className="size-4" />
                                            ) : isDone ? (
                                                <Check className="size-4" />
                                            ) : (
                                                step.id
                                            )}
                                        </div>
                                        <Icon
                                            className={`size-4 shrink-0 transition-colors ${
                                                isActive ? 'text-primary' : 'text-muted-foreground'
                                            }`}
                                        />
                                    </div>

                                    {errCount > 0 && (
                                        <Badge variant="destructive" className="border border-destructive text-[10px] font-black px-1.5 py-0">
                                            {errCount}
                                        </Badge>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p
                                        className={`truncate text-xs font-black uppercase tracking-wider ${
                                            isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                                        }`}
                                    >
                                        {step.shortTitle}
                                    </p>
                                    <p className="hidden text-[11px] text-muted-foreground line-clamp-1 sm:block">
                                        {step.description}
                                    </p>
                                </div>

                                {isActive && (
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-primary sm:block" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Stepper Progress Bar */}
                <div className="flex items-center justify-between px-4 py-2 text-xs font-bold text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <span className="text-foreground">Langkah {currentStep}</span> dari {totalSteps}:{' '}
                        <span className="text-foreground">{activeStepMeta.title}</span>
                    </span>
                    <span className="font-mono">{progressPercent}% selesai</span>
                </div>
                <div className="h-1.5 w-full bg-muted">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* ── Global Alert jika ada error validasi ── */}
            {Object.keys(errors).length > 0 && (
                <Alert variant="destructive" className="border-2 border-destructive bg-destructive/10 text-destructive shadow-xs">
                    <AlertCircle className="size-4 shrink-0" />
                    <AlertTitle className="font-bold">Ada field yang perlu diperbaiki</AlertTitle>
                    <AlertDescription className="text-xs">
                        Terdapat kesalahan validasi pada formulir. Periksa tab bertanda merah di atas atau kolom yang memiliki pesan error di bawah ini.
                    </AlertDescription>
                </Alert>
            )}

            {/* ── STEP 1: INFORMASI DASAR ── */}
            {currentStep === 1 && (
                <div className="border-2 border-foreground bg-card p-5 shadow-xs sm:p-7">
                    <div className="mb-6 flex items-start gap-3 border-b-2 border-foreground/15 pb-4">
                        <div className="flex size-10 shrink-0 items-center justify-center border-2 border-foreground bg-primary shadow-2xs">
                            <Sparkles className="size-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight sm:text-xl">Langkah 1: Informasi Dasar Event</h2>
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                Masukkan judul, kategori, visibilitas status, kapasitas peserta, dan poster/banner event.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        {/* Title */}
                        <div className="sm:col-span-2 flex flex-col gap-1.5">
                            <Label htmlFor="title" className="font-bold">
                                Judul Event <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Contoh: Indonesia Tech Summit 2026"
                                className="border-2 border-foreground/40 focus:border-foreground"
                            />
                            <InputError message={errors.title} />
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-2 flex flex-col gap-1.5">
                            <Label htmlFor="description" className="font-bold">Deskripsi Event</Label>
                            <textarea
                                id="description"
                                rows={4}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Deskripsikan konsep acara, hal menarik yang akan didapatkan peserta, serta info penting lainnya..."
                                className="w-full resize-y border-2 border-foreground/40 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                            />
                            <InputError message={errors.description} />
                        </div>

                        {/* Category */}
                        <div className="flex flex-col gap-1.5">
                            <Label className="font-bold">
                                Kategori <span className="text-destructive">*</span>
                            </Label>
                            <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                                <SelectTrigger className="border-2 border-foreground/40 focus:border-foreground">
                                    <SelectValue placeholder="Pilih kategori event..." />
                                </SelectTrigger>
                                <SelectContent className="border-2 border-foreground">
                                    {EVENT_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.category} />
                        </div>

                        {/* Type */}
                        <div className="flex flex-col gap-1.5">
                            <Label className="font-bold">
                                Tipe Event <span className="text-destructive">*</span>
                            </Label>
                            <div className="flex gap-2">
                                {(
                                    [
                                        { key: 'offline', label: 'Offline' },
                                        { key: 'online', label: 'Online' },
                                        { key: 'hybrid', label: 'Hybrid' },
                                    ] as const
                                ).map((t) => (
                                    <button
                                        key={t.key}
                                        type="button"
                                        onClick={() => setData('type', t.key)}
                                        className={`flex-1 border-2 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                                            data.type === t.key
                                                ? 'border-foreground bg-foreground text-background shadow-xs'
                                                : 'border-foreground/30 text-muted-foreground hover:border-foreground'
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                            <InputError message={errors.type} />
                        </div>

                        {/* Status */}
                        <div className="sm:col-span-2 flex flex-col gap-1.5">
                            <Label className="font-bold">
                                Status Publikasi Event <span className="text-destructive">*</span>
                            </Label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {(
                                    [
                                        { key: 'draft', label: 'Draft', desc: 'Hanya Anda yang melihat' },
                                        { key: 'published', label: 'Published', desc: 'Tayang ke publik' },
                                        { key: 'cancelled', label: 'Dibatalkan', desc: 'Pemberitahuan batal' },
                                        { key: 'completed', label: 'Selesai', desc: 'Event telah berakhir' },
                                    ] as const
                                ).map((s) => (
                                    <button
                                        key={s.key}
                                        type="button"
                                        onClick={() => setData('status', s.key)}
                                        className={`flex flex-col items-center justify-center border-2 p-2.5 text-center transition-all ${
                                            data.status === s.key
                                                ? 'border-foreground bg-foreground text-background shadow-xs'
                                                : 'border-foreground/30 text-muted-foreground hover:border-foreground'
                                        }`}
                                    >
                                        <span className="text-xs font-black uppercase tracking-wider">{s.label}</span>
                                        <span className="text-[10px] opacity-80">{s.desc}</span>
                                    </button>
                                ))}
                            </div>
                            <InputError message={errors.status} />
                        </div>

                        {/* Max attendees */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="max_attendees" className="font-bold">Kapasitas Maks. Peserta</Label>
                            <Input
                                id="max_attendees"
                                type="number"
                                min="1"
                                value={data.max_attendees}
                                onChange={(e) => setData('max_attendees', e.target.value)}
                                placeholder="Kosongkan jika kuota tidak dibatasi"
                                className="border-2 border-foreground/40 focus:border-foreground"
                            />
                            <InputError message={errors.max_attendees} />
                        </div>

                        {/* Tags */}
                        <div className="flex flex-col gap-1.5">
                            <Label className="font-bold">Tags / Kata Kunci</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addTag();
                                        }
                                    }}
                                    placeholder="Ketik tag lalu tekan Enter / tombol +"
                                    className="border-2 border-foreground/40 focus:border-foreground"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-2 border-foreground font-bold shadow-2xs"
                                    onClick={addTag}
                                >
                                    <Plus className="size-4" />
                                </Button>
                            </div>
                            {data.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {data.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="border-2 border-foreground/40 font-bold text-xs">
                                            #{tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="ml-1.5 rounded-full hover:text-destructive"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cover image upload & preview */}
                        <div className="sm:col-span-2 flex flex-col gap-2 border-2 border-dashed border-foreground/30 p-4">
                            <Label htmlFor="cover_image" className="font-bold flex items-center gap-2">
                                <ImageIcon className="size-4 text-primary" />
                                Cover Image / Banner Event
                            </Label>
                            <input
                                id="cover_image"
                                type="file"
                                accept="image/*"
                                onChange={handleCoverChange}
                                className="w-full border-2 border-foreground/40 bg-background px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-bold hover:border-foreground"
                            />
                            <p className="text-xs text-muted-foreground">Format yang didukung: JPG, PNG, WEBP. Maksimal 5 MB.</p>
                            <InputError message={errors.cover_image as string} />

                            {/* Image Preview */}
                            {(coverPreview || existingCoverImage) && (
                                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <div className="relative h-28 w-48 overflow-hidden border-2 border-foreground bg-muted shadow-2xs">
                                        <img
                                            src={coverPreview || `/storage/${existingCoverImage}`}
                                            alt="Cover Preview"
                                            className="size-full object-cover"
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        <p className="font-bold text-foreground">
                                            {coverPreview ? 'Cover Baru Terpilih' : 'Cover Saat Ini'}
                                        </p>
                                        <p>
                                            {coverPreview
                                                ? 'Gambar ini akan diunggah saat formulir disimpan.'
                                                : 'Gambar ini sedang aktif. Pilih file baru di atas jika ingin mengganti.'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── STEP 2: TANGGAL & WAKTU ── */}
            {currentStep === 2 && (
                <div className="border-2 border-foreground bg-card p-5 shadow-xs sm:p-7">
                    <div className="mb-6 flex items-start gap-3 border-b-2 border-foreground/15 pb-4">
                        <div className="flex size-10 shrink-0 items-center justify-center border-2 border-foreground bg-primary shadow-2xs">
                            <CalendarDays className="size-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight sm:text-xl">Langkah 2: Tanggal & Waktu Pelaksanaan</h2>
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                Atur rentang waktu acara dimulai hingga selesai, serta periode pendaftaran dibuka untuk peserta.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Waktu Pelaksanaan */}
                        <div className="sm:col-span-2 border-2 border-foreground/30 p-4 bg-muted/10">
                            <div className="mb-3 flex items-center gap-2 font-black text-sm">
                                <Clock className="size-4 text-primary" />
                                <span>Waktu Penyelenggaraan Event</span>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="start_date" className="font-bold">
                                        Tanggal & Jam Mulai <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="start_date"
                                        type="datetime-local"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="border-2 border-foreground/40 focus:border-foreground"
                                    />
                                    <InputError message={errors.start_date} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="end_date" className="font-bold">
                                        Tanggal & Jam Selesai <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="end_date"
                                        type="datetime-local"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className="border-2 border-foreground/40 focus:border-foreground"
                                    />
                                    <InputError message={errors.end_date} />
                                </div>
                            </div>
                        </div>

                        {/* Periode Pendaftaran */}
                        <div className="sm:col-span-2 border-2 border-foreground/30 p-4 bg-muted/10">
                            <div className="mb-3 flex items-center gap-2 font-black text-sm">
                                <FileText className="size-4 text-primary" />
                                <span>Periode Pendaftaran Peserta (Opsional)</span>
                            </div>
                            <p className="mb-3 text-xs text-muted-foreground">
                                Batasi kapan calon peserta dapat mendaftar atau membeli tiket event ini.
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="registration_start" className="font-bold">Pendaftaran Dibuka</Label>
                                    <Input
                                        id="registration_start"
                                        type="datetime-local"
                                        value={data.registration_start}
                                        onChange={(e) => setData('registration_start', e.target.value)}
                                        className="border-2 border-foreground/40 focus:border-foreground"
                                    />
                                    <InputError message={errors.registration_start} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="registration_end" className="font-bold">Pendaftaran Ditutup</Label>
                                    <Input
                                        id="registration_end"
                                        type="datetime-local"
                                        value={data.registration_end}
                                        onChange={(e) => setData('registration_end', e.target.value)}
                                        className="border-2 border-foreground/40 focus:border-foreground"
                                    />
                                    <InputError message={errors.registration_end} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── STEP 3: LOKASI & AKSES ── */}
            {currentStep === 3 && (
                <div className="border-2 border-foreground bg-card p-5 shadow-xs sm:p-7">
                    <div className="mb-6 flex items-start gap-3 border-b-2 border-foreground/15 pb-4">
                        <div className="flex size-10 shrink-0 items-center justify-center border-2 border-foreground bg-primary shadow-2xs">
                            <MapPin className="size-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight sm:text-xl">Langkah 3: Lokasi & Akses Acara</h2>
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                Tentukan tempat fisik penyelenggaraan dan/atau tautan platform online berdasarkan tipe event ({data.type.toUpperCase()}).
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Offline Location Section */}
                        {isOffline && (
                            <div className="border-2 border-foreground/30 p-5 bg-muted/10">
                                <div className="mb-4 flex items-center gap-2">
                                    <MapPin className="size-5 text-primary" />
                                    <div>
                                        <h3 className="font-black text-sm sm:text-base">Lokasi Fisik (Offline)</h3>
                                        <p className="text-xs text-muted-foreground">Detail tempat yang akan dikunjungi oleh peserta</p>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="location_name" className="font-bold">
                                            Nama Gedung / Tempat <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="location_name"
                                            value={data.location_name}
                                            onChange={(e) => setData('location_name', e.target.value)}
                                            placeholder="Contoh: Balai Sarbini / CoHive Mega Kuningan"
                                            className="border-2 border-foreground/40 focus:border-foreground"
                                        />
                                        <InputError message={errors.location_name} />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="location_maps_url" className="font-bold">Link Google Maps</Label>
                                        <div className="relative flex items-center">
                                            <Input
                                                id="location_maps_url"
                                                type="url"
                                                value={data.location_maps_url}
                                                onChange={(e) => setData('location_maps_url', e.target.value)}
                                                placeholder="https://maps.app.goo.gl/..."
                                                className="border-2 border-foreground/40 pr-9 focus:border-foreground"
                                            />
                                            {data.location_maps_url && (
                                                <a
                                                    href={data.location_maps_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute right-2 text-muted-foreground hover:text-foreground"
                                                    title="Buka Maps"
                                                >
                                                    <ExternalLink className="size-4" />
                                                </a>
                                            )}
                                        </div>
                                        <InputError message={errors.location_maps_url} />
                                    </div>

                                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                                        <Label htmlFor="location_address" className="font-bold">Alamat Lengkap</Label>
                                        <textarea
                                            id="location_address"
                                            rows={3}
                                            value={data.location_address}
                                            onChange={(e) => setData('location_address', e.target.value)}
                                            placeholder="Jalan, nomor, kelurahan, kecamatan, kota, kode pos..."
                                            className="w-full resize-y border-2 border-foreground/40 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                                        />
                                        <InputError message={errors.location_address} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Online Streaming / Meeting Section */}
                        {isOnline && (
                            <div className="border-2 border-foreground/30 p-5 bg-muted/10">
                                <div className="mb-4 flex items-center gap-2">
                                    <Monitor className="size-5 text-primary" />
                                    <div>
                                        <h3 className="font-black text-sm sm:text-base">Akses Online / Streaming</h3>
                                        <p className="text-xs text-muted-foreground">Tautan ruang virtual tempat pertemuan atau siaran</p>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex flex-col gap-1.5">
                                        <Label className="font-bold">Platform Online</Label>
                                        <Select
                                            value={data.online_platform}
                                            onValueChange={(v) => setData('online_platform', v)}
                                        >
                                            <SelectTrigger className="border-2 border-foreground/40 focus:border-foreground">
                                                <SelectValue placeholder="Pilih platform..." />
                                            </SelectTrigger>
                                            <SelectContent className="border-2 border-foreground">
                                                {ONLINE_PLATFORMS.map((p) => (
                                                    <SelectItem key={p} value={p.toLowerCase()}>{p}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.online_platform} />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="online_url" className="font-bold">Link Meeting / Live Streaming</Label>
                                        <Input
                                            id="online_url"
                                            type="url"
                                            value={data.online_url}
                                            onChange={(e) => setData('online_url', e.target.value)}
                                            placeholder="Contoh: https://zoom.us/j/123456789"
                                            className="border-2 border-foreground/40 focus:border-foreground"
                                        />
                                        <InputError message={errors.online_url} />
                                    </div>

                                    <div className="sm:col-span-2 flex flex-col gap-3 pt-1">
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setData('online_url_protected', !data.online_url_protected)}
                                                className={`flex items-center gap-2 border-2 px-3 py-2 text-xs font-bold transition-all ${
                                                    data.online_url_protected
                                                        ? 'border-foreground bg-foreground text-background shadow-2xs'
                                                        : 'border-foreground/30 text-muted-foreground hover:border-foreground'
                                                }`}
                                            >
                                                {data.online_url_protected ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
                                                {data.online_url_protected ? 'Link Terproteksi Password (Aktif)' : 'Aktifkan Password Link Meeting'}
                                            </button>
                                        </div>

                                        {data.online_url_protected && (
                                            <div className="flex flex-col gap-1.5 sm:max-w-md">
                                                <Label htmlFor="online_url_password" className="font-bold">
                                                    Password / Passcode Room
                                                </Label>
                                                <Input
                                                    id="online_url_password"
                                                    type="text"
                                                    value={data.online_url_password}
                                                    onChange={(e) => setData('online_url_password', e.target.value)}
                                                    placeholder="Contoh: SEMINAR2026"
                                                    className="border-2 border-foreground/40 focus:border-foreground"
                                                />
                                                <InputError message={errors.online_url_password} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── STEP 4: TIKET & KUPON ── */}
            {currentStep === 4 && (
                <div className="border-2 border-foreground bg-card p-5 shadow-xs sm:p-7">
                    <div className="mb-6 flex items-start gap-3 border-b-2 border-foreground/15 pb-4">
                        <div className="flex size-10 shrink-0 items-center justify-center border-2 border-foreground bg-primary shadow-2xs">
                            <Ticket className="size-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight sm:text-xl">Langkah 4: Konfigurasi Tiket & Kupon Promo</h2>
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                Tentukan kategori tiket masuk (gratis / berbayar), kuota, periode penjualan, serta kode voucher diskon.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        {/* Sub-section Tiket */}
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Ticket className="size-4 text-primary" />
                                    <h3 className="font-black text-base">Kategori Tiket ({data.tickets.length})</h3>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="border-2 border-foreground font-bold shadow-2xs"
                                    onClick={() => setData('tickets', [...data.tickets, defaultTicket()])}
                                >
                                    <Plus className="size-4" />
                                    Tambah Tiket
                                </Button>
                            </div>

                            {data.tickets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-foreground/30 bg-muted/10 p-6 text-center">
                                    <p className="text-xs font-semibold text-muted-foreground">
                                        Belum ada tipe tiket yang dibuat. Klik tombol di bawah untuk menambahkan tiket gratis atau berbayar.
                                    </p>
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="mt-3 border-2 border-foreground font-bold shadow-2xs"
                                        onClick={() => setData('tickets', [...data.tickets, defaultTicket()])}
                                    >
                                        <Plus className="size-4" /> Tambah Tiket Pertama
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {data.tickets.map((ticket, idx) => (
                                        <div key={ticket._key} className="border-2 border-foreground/40 bg-muted/10 p-4 shadow-2xs">
                                            <div className="mb-3 flex items-center justify-between border-b border-foreground/15 pb-2">
                                                <span className="font-mono text-xs font-black uppercase bg-primary/20 px-2 py-0.5 border border-foreground">
                                                    Tiket #{idx + 1}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeItem('tickets', ticket._key)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">
                                                        Nama Tiket <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        value={ticket.name}
                                                        onChange={(e) => updateTicket(ticket._key, 'name', e.target.value)}
                                                        placeholder="Contoh: Reguler / VIP / Presale 1"
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                    <InputError message={(errors as Record<string, string>)[`tickets.${idx}.name`]} />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Tipe Tiket</Label>
                                                    <div className="flex gap-2">
                                                        {(['free', 'paid'] as const).map((t) => (
                                                            <button
                                                                key={t}
                                                                type="button"
                                                                onClick={() => updateTicket(ticket._key, 'type', t)}
                                                                className={`flex-1 border-2 py-1.5 text-xs font-bold uppercase transition-all ${
                                                                    ticket.type === t
                                                                        ? 'border-foreground bg-foreground text-background shadow-2xs'
                                                                        : 'border-foreground/30 text-muted-foreground hover:border-foreground'
                                                                }`}
                                                            >
                                                                {t === 'free' ? 'Gratis' : 'Berbayar'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {ticket.type === 'paid' && (
                                                    <div className="flex flex-col gap-1.5">
                                                        <Label className="font-bold text-xs">
                                                            Harga (Rp) <span className="text-destructive">*</span>
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={ticket.price}
                                                            onChange={(e) => updateTicket(ticket._key, 'price', e.target.value)}
                                                            placeholder="Contoh: 150000"
                                                            className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                        />
                                                        <InputError message={(errors as Record<string, string>)[`tickets.${idx}.price`]} />
                                                    </div>
                                                )}

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Kuota Tiket</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={ticket.quota}
                                                        onChange={(e) => updateTicket(ticket._key, 'quota', e.target.value)}
                                                        placeholder="Kosongkan jika kuota tak terbatas"
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Penjualan Dibuka</Label>
                                                    <Input
                                                        type="datetime-local"
                                                        value={ticket.sale_start}
                                                        onChange={(e) => updateTicket(ticket._key, 'sale_start', e.target.value)}
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Penjualan Ditutup</Label>
                                                    <Input
                                                        type="datetime-local"
                                                        value={ticket.sale_end}
                                                        onChange={(e) => updateTicket(ticket._key, 'sale_end', e.target.value)}
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                </div>

                                                <div className="sm:col-span-2 flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Deskripsi Tiket</Label>
                                                    <Input
                                                        value={ticket.description}
                                                        onChange={(e) => updateTicket(ticket._key, 'description', e.target.value)}
                                                        placeholder="Catatan tambahan mengenai tiket ini..."
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                </div>

                                                {/* Perks */}
                                                <div className="sm:col-span-2 flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Fasilitas / Keuntungan (Perks)</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={perkInputs[ticket._key] || ''}
                                                            onChange={(e) => setPerkInputs((p) => ({ ...p, [ticket._key]: e.target.value }))}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    addPerk(ticket._key);
                                                                }
                                                            }}
                                                            placeholder="Contoh: Sertifikat, Goodie Bag, Coffee Break..."
                                                            className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="border-2 border-foreground"
                                                            onClick={() => addPerk(ticket._key)}
                                                        >
                                                            <Plus className="size-4" />
                                                        </Button>
                                                    </div>
                                                    {ticket.perks.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                                            {ticket.perks.map((perk, pi) => (
                                                                <Badge key={pi} variant="secondary" className="border border-foreground/30 text-xs font-semibold">
                                                                    {perk}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removePerk(ticket._key, pi)}
                                                                        className="ml-1.5 hover:text-destructive"
                                                                    >
                                                                        <X className="size-3" />
                                                                    </button>
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Separator className="bg-foreground/20" />

                        {/* Sub-section Kupon */}
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Tag className="size-4 text-primary" />
                                    <h3 className="font-black text-base">Kupon & Promo ({data.coupons.length})</h3>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="border-2 border-foreground font-bold shadow-2xs"
                                    onClick={() => setData('coupons', [...data.coupons, defaultCoupon()])}
                                >
                                    <Plus className="size-4" />
                                    Tambah Kupon
                                </Button>
                            </div>

                            {data.coupons.length === 0 ? (
                                <div className="border-2 border-dashed border-foreground/30 bg-muted/10 p-5 text-center text-xs text-muted-foreground">
                                    Belum ada kupon diskon. Kupon bersifat opsional dan bisa ditambahkan jika ingin memberikan promo potongan harga ke peserta.
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {data.coupons.map((coupon, idx) => (
                                        <div key={coupon._key} className="border-2 border-foreground/40 bg-muted/10 p-4 shadow-2xs">
                                            <div className="mb-3 flex items-center justify-between border-b border-foreground/15 pb-2">
                                                <span className="font-mono text-xs font-black uppercase bg-primary/20 px-2 py-0.5 border border-foreground">
                                                    Kupon #{idx + 1}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeItem('coupons', coupon._key)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">
                                                        Kode Kupon <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        value={coupon.code}
                                                        onChange={(e) => updateItem<CouponRow>('coupons', coupon._key, { code: e.target.value.toUpperCase() })}
                                                        placeholder="Contoh: PROMO2026"
                                                        className="border-2 border-foreground/40 font-mono text-sm uppercase focus:border-foreground"
                                                    />
                                                    <InputError message={(errors as Record<string, string>)[`coupons.${idx}.code`]} />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Tipe Diskon</Label>
                                                    <div className="flex gap-2">
                                                        {(['percentage', 'fixed'] as const).map((t) => (
                                                            <button
                                                                key={t}
                                                                type="button"
                                                                onClick={() => updateItem<CouponRow>('coupons', coupon._key, { discount_type: t })}
                                                                className={`flex-1 border-2 py-1.5 text-xs font-bold transition-all ${
                                                                    coupon.discount_type === t
                                                                        ? 'border-foreground bg-foreground text-background shadow-2xs'
                                                                        : 'border-foreground/30 text-muted-foreground hover:border-foreground'
                                                                }`}
                                                            >
                                                                {t === 'percentage' ? 'Persen (%)' : 'Potongan Tetap (Rp)'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">
                                                        Nilai Diskon {coupon.discount_type === 'percentage' ? '(%)' : '(Rp)'} <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max={coupon.discount_type === 'percentage' ? 100 : undefined}
                                                        value={coupon.discount_value}
                                                        onChange={(e) => updateItem<CouponRow>('coupons', coupon._key, { discount_value: e.target.value })}
                                                        placeholder={coupon.discount_type === 'percentage' ? '20' : '50000'}
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                    <InputError message={(errors as Record<string, string>)[`coupons.${idx}.discount_value`]} />
                                                </div>

                                                {coupon.discount_type === 'percentage' && (
                                                    <div className="flex flex-col gap-1.5">
                                                        <Label className="font-bold text-xs">Maks. Potongan (Rp)</Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={coupon.max_discount_amount}
                                                            onChange={(e) => updateItem<CouponRow>('coupons', coupon._key, { max_discount_amount: e.target.value })}
                                                            placeholder="Kosongkan jika tanpa batas"
                                                            className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Batas Pemakaian Total</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={coupon.max_uses}
                                                        onChange={(e) => updateItem<CouponRow>('coupons', coupon._key, { max_uses: e.target.value })}
                                                        placeholder="Kosongkan jika tak terbatas"
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Min. Pembelian (Rp)</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={coupon.minimum_purchase}
                                                        onChange={(e) => updateItem<CouponRow>('coupons', coupon._key, { minimum_purchase: e.target.value })}
                                                        placeholder="Kosongkan jika tanpa batas minimum"
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Berlaku Dari</Label>
                                                    <Input
                                                        type="datetime-local"
                                                        value={coupon.valid_from}
                                                        onChange={(e) => updateItem<CouponRow>('coupons', coupon._key, { valid_from: e.target.value })}
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Berlaku Hingga</Label>
                                                    <Input
                                                        type="datetime-local"
                                                        value={coupon.valid_until}
                                                        onChange={(e) => updateItem<CouponRow>('coupons', coupon._key, { valid_until: e.target.value })}
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── STEP 5: AGENDA, PEMBICARA & SPONSOR ── */}
            {currentStep === 5 && (
                <div className="border-2 border-foreground bg-card p-5 shadow-xs sm:p-7">
                    <div className="mb-6 flex items-start gap-3 border-b-2 border-foreground/15 pb-4">
                        <div className="flex size-10 shrink-0 items-center justify-center border-2 border-foreground bg-primary shadow-2xs">
                            <Users className="size-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight sm:text-xl">Langkah 5: Agenda, Pembicara & Sponsor</h2>
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                Susun susunan rundown sesi acara, profil pembicara (speakers), dan logo sponsor atau mitra pendukung.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        {/* Sub-section Agenda */}
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="size-4 text-primary" />
                                    <h3 className="font-black text-base">Rundown / Agenda Sesi ({data.agendas.length})</h3>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="border-2 border-foreground font-bold shadow-2xs"
                                    onClick={() => setData('agendas', [...data.agendas, defaultAgenda()])}
                                >
                                    <Plus className="size-4" />
                                    Tambah Sesi
                                </Button>
                            </div>

                            {data.agendas.length === 0 ? (
                                <div className="border-2 border-dashed border-foreground/30 bg-muted/10 p-5 text-center text-xs text-muted-foreground">
                                    Belum ada rundown sesi. Anda bisa menambahkan jadwal sesi acara seperti Opening, Keynote, Workshop, dll.
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {data.agendas.map((agenda, idx) => (
                                        <div key={agenda._key} className="border-2 border-foreground/40 bg-muted/10 p-4 shadow-2xs">
                                            <div className="mb-3 flex items-center justify-between border-b border-foreground/15 pb-2">
                                                <span className="font-mono text-xs font-black uppercase bg-primary/20 px-2 py-0.5 border border-foreground">
                                                    Sesi #{idx + 1}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeItem('agendas', agenda._key)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-3">
                                                <div className="sm:col-span-2 flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">
                                                        Judul Sesi <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        value={agenda.title}
                                                        onChange={(e) => updateItem<AgendaRow>('agendas', agenda._key, { title: e.target.value })}
                                                        placeholder="Contoh: Keynote Speech / Panel Discussion"
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                    <InputError message={(errors as Record<string, string>)[`agendas.${idx}.title`]} />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Tanggal</Label>
                                                    <Input
                                                        type="date"
                                                        value={agenda.date}
                                                        onChange={(e) => updateItem<AgendaRow>('agendas', agenda._key, { date: e.target.value })}
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">
                                                        Jam Mulai <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        type="time"
                                                        value={agenda.start_time}
                                                        onChange={(e) => updateItem<AgendaRow>('agendas', agenda._key, { start_time: e.target.value })}
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                    <InputError message={(errors as Record<string, string>)[`agendas.${idx}.start_time`]} />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Jam Selesai</Label>
                                                    <Input
                                                        type="time"
                                                        value={agenda.end_time}
                                                        onChange={(e) => updateItem<AgendaRow>('agendas', agenda._key, { end_time: e.target.value })}
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Narasumber / Pembicara</Label>
                                                    <Input
                                                        value={agenda.speaker_name}
                                                        onChange={(e) => updateItem<AgendaRow>('agendas', agenda._key, { speaker_name: e.target.value })}
                                                        placeholder="Nama narasumber sesi ini"
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                </div>

                                                <div className="sm:col-span-3 flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Keterangan Sesi</Label>
                                                    <Input
                                                        value={agenda.description}
                                                        onChange={(e) => updateItem<AgendaRow>('agendas', agenda._key, { description: e.target.value })}
                                                        placeholder="Ringkasan poin-poin yang akan dibahas..."
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Separator className="bg-foreground/20" />

                        {/* Sub-section Speakers */}
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Mic className="size-4 text-primary" />
                                    <h3 className="font-black text-base">Pembicara (Speakers) ({data.speakers.length})</h3>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="border-2 border-foreground font-bold shadow-2xs"
                                    onClick={() => setData('speakers', [...data.speakers, defaultSpeaker()])}
                                >
                                    <Plus className="size-4" />
                                    Tambah Pembicara
                                </Button>
                            </div>

                            {data.speakers.length === 0 ? (
                                <div className="border-2 border-dashed border-foreground/30 bg-muted/10 p-5 text-center text-xs text-muted-foreground">
                                    Belum ada pembicara yang didaftarkan. Anda dapat menambahkan nama dan profil narasumber di sini.
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {data.speakers.map((speaker, idx) => (
                                        <div key={speaker._key} className="border-2 border-foreground/40 bg-muted/10 p-4 shadow-2xs">
                                            <div className="mb-3 flex items-center justify-between border-b border-foreground/15 pb-2">
                                                <span className="font-mono text-xs font-black uppercase bg-primary/20 px-2 py-0.5 border border-foreground">
                                                    Pembicara #{idx + 1}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeItem('speakers', speaker._key)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">
                                                        Nama Lengkap <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        value={speaker.name}
                                                        onChange={(e) => updateItem<SpeakerRow>('speakers', speaker._key, { name: e.target.value })}
                                                        placeholder="Contoh: Dr. Jane Doe"
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                    <InputError message={(errors as Record<string, string>)[`speakers.${idx}.name`]} />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Jabatan / Posisi</Label>
                                                    <Input
                                                        value={speaker.title}
                                                        onChange={(e) => updateItem<SpeakerRow>('speakers', speaker._key, { title: e.target.value })}
                                                        placeholder="Contoh: VP of Technology"
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Perusahaan / Afiliasi</Label>
                                                    <Input
                                                        value={speaker.company}
                                                        onChange={(e) => updateItem<SpeakerRow>('speakers', speaker._key, { company: e.target.value })}
                                                        placeholder="Contoh: Google / Tech Corp"
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">URL LinkedIn</Label>
                                                    <Input
                                                        type="url"
                                                        value={speaker.linkedin_url}
                                                        onChange={(e) => updateItem<SpeakerRow>('speakers', speaker._key, { linkedin_url: e.target.value })}
                                                        placeholder="https://linkedin.com/in/..."
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                </div>

                                                {/* Upload Avatar Speaker */}
                                                <div className="sm:col-span-2 flex flex-col gap-2 border-2 border-dashed border-foreground/30 p-3 bg-background">
                                                    <Label className="font-bold text-xs flex items-center gap-1.5">
                                                        <ImageIcon className="size-3.5 text-primary" />
                                                        Foto / Avatar Pembicara
                                                    </Label>
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                                        {/* Avatar Preview */}
                                                        <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden border-2 border-foreground bg-muted shadow-2xs">
                                                            {speaker.avatar ? (
                                                                <img
                                                                    src={
                                                                        speaker.avatar instanceof File
                                                                            ? URL.createObjectURL(speaker.avatar)
                                                                            : `/storage/${speaker.avatar}`
                                                                    }
                                                                    alt={speaker.name || 'Speaker'}
                                                                    className="size-full object-cover"
                                                                />
                                                            ) : (
                                                                <Users className="size-6 text-muted-foreground/40" />
                                                            )}
                                                        </div>

                                                        <div className="flex-1 flex flex-col gap-1.5">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0] ?? null;
                                                                    updateItem<SpeakerRow>('speakers', speaker._key, { avatar: file });
                                                                }}
                                                                className="w-full border-2 border-foreground/40 bg-background px-2.5 py-1.5 text-xs file:mr-2 file:border-0 file:bg-transparent file:text-xs file:font-bold hover:border-foreground"
                                                            />
                                                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                                                <span>Format: JPG, PNG, WEBP. Maksimal 2 MB.</span>
                                                                {speaker.avatar && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateItem<SpeakerRow>('speakers', speaker._key, { avatar: null })}
                                                                        className="font-bold text-destructive hover:underline"
                                                                    >
                                                                        Hapus Foto
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <InputError message={(errors as Record<string, string>)[`speakers.${idx}.avatar`]} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="sm:col-span-2 flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Bio Singkat</Label>
                                                    <textarea
                                                        rows={2}
                                                        value={speaker.bio}
                                                        onChange={(e) => updateItem<SpeakerRow>('speakers', speaker._key, { bio: e.target.value })}
                                                        placeholder="Profil singkat pengalaman narasumber..."
                                                        className="w-full resize-y border-2 border-foreground/40 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Separator className="bg-foreground/20" />

                        {/* Sub-section Sponsors */}
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 className="size-4 text-primary" />
                                    <h3 className="font-black text-base">Sponsor & Mitra ({data.sponsors.length})</h3>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="border-2 border-foreground font-bold shadow-2xs"
                                    onClick={() => setData('sponsors', [...data.sponsors, defaultSponsor()])}
                                >
                                    <Plus className="size-4" />
                                    Tambah Sponsor
                                </Button>
                            </div>

                            {data.sponsors.length === 0 ? (
                                <div className="border-2 border-dashed border-foreground/30 bg-muted/10 p-5 text-center text-xs text-muted-foreground">
                                    Belum ada sponsor yang dicantumkan. Sponsor bersifat opsional untuk menampilkan brand pendukung event.
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {data.sponsors.map((sponsor, idx) => (
                                        <div key={sponsor._key} className="border-2 border-foreground/40 bg-muted/10 p-4 shadow-2xs">
                                            <div className="mb-3 flex items-center justify-between border-b border-foreground/15 pb-2">
                                                <span className="font-mono text-xs font-black uppercase bg-primary/20 px-2 py-0.5 border border-foreground">
                                                    Sponsor #{idx + 1}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeItem('sponsors', sponsor._key)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-3">
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">
                                                        Nama Sponsor <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        value={sponsor.name}
                                                        onChange={(e) => updateItem<SponsorRow>('sponsors', sponsor._key, { name: e.target.value })}
                                                        placeholder="Contoh: Antigravity Inc"
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                    <InputError message={(errors as Record<string, string>)[`sponsors.${idx}.name`]} />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Tingkatan (Tier)</Label>
                                                    <Select
                                                        value={sponsor.tier}
                                                        onValueChange={(v) => updateItem<SponsorRow>('sponsors', sponsor._key, { tier: v as SponsorRow['tier'] })}
                                                    >
                                                        <SelectTrigger className="border-2 border-foreground/40 text-sm focus:border-foreground">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="border-2 border-foreground">
                                                            {SPONSOR_TIERS.map((t) => (
                                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="font-bold text-xs">Website Sponsor</Label>
                                                    <Input
                                                        type="url"
                                                        value={sponsor.website_url}
                                                        onChange={(e) => updateItem<SponsorRow>('sponsors', sponsor._key, { website_url: e.target.value })}
                                                        placeholder="https://sponsor.com"
                                                        className="border-2 border-foreground/40 text-sm focus:border-foreground"
                                                    />
                                                </div>

                                                {/* Upload Logo Sponsor */}
                                                <div className="sm:col-span-3 flex flex-col gap-2 border-2 border-dashed border-foreground/30 p-3 bg-background">
                                                    <Label className="font-bold text-xs flex items-center gap-1.5">
                                                        <Building2 className="size-3.5 text-primary" />
                                                        Logo Sponsor / Mitra
                                                    </Label>
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                                        {/* Logo Preview */}
                                                        <div className="relative flex h-14 w-28 shrink-0 items-center justify-center overflow-hidden border-2 border-foreground bg-muted p-1 shadow-2xs">
                                                            {sponsor.logo ? (
                                                                <img
                                                                    src={
                                                                        sponsor.logo instanceof File
                                                                            ? URL.createObjectURL(sponsor.logo)
                                                                            : `/storage/${sponsor.logo}`
                                                                    }
                                                                    alt={sponsor.name || 'Sponsor Logo'}
                                                                    className="max-h-full max-w-full object-contain"
                                                                />
                                                            ) : (
                                                                <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground/60">No Logo</span>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 flex flex-col gap-1.5">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0] ?? null;
                                                                    updateItem<SponsorRow>('sponsors', sponsor._key, { logo: file });
                                                                }}
                                                                className="w-full border-2 border-foreground/40 bg-background px-2.5 py-1.5 text-xs file:mr-2 file:border-0 file:bg-transparent file:text-xs file:font-bold hover:border-foreground"
                                                            />
                                                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                                                <span>Format: PNG, JPG, WEBP, SVG. Maksimal 2 MB.</span>
                                                                {sponsor.logo && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateItem<SponsorRow>('sponsors', sponsor._key, { logo: null })}
                                                                        className="font-bold text-destructive hover:underline"
                                                                    >
                                                                        Hapus Logo
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <InputError message={(errors as Record<string, string>)[`sponsors.${idx}.logo`]} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Sticky Bottom Navigation Bar ── */}
            <div className="sticky bottom-0 z-30 flex flex-col gap-3 border-2 border-foreground bg-background/95 p-4 backdrop-blur-md shadow-md sm:flex-row sm:items-center sm:justify-between">
                {/* Left: Previous step button */}
                <div className="flex items-center gap-2">
                    {currentStep > 1 ? (
                        <Button
                            type="button"
                            variant="outline"
                            className="border-2 border-foreground font-bold shadow-xs active:translate-x-0.5 active:translate-y-0.5"
                            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                        >
                            <ArrowLeft className="size-4" />
                            Sebelumnya
                        </Button>
                    ) : (
                        <span className="text-xs text-muted-foreground font-semibold hidden sm:inline">
                            Langkah Awal: Isi informasi dasar
                        </span>
                    )}
                </div>

                {/* Right: Step indicator & actions */}
                <div className="flex flex-wrap items-center justify-end gap-2">
                    {/* Save Draft Button (selalu tersedia) */}
                    <Button
                        type="button"
                        variant="outline"
                        className="border-2 border-foreground font-bold shadow-xs active:translate-x-0.5 active:translate-y-0.5"
                        disabled={processing}
                        onClick={(e) => {
                            setData('status', 'draft');
                            handleSubmit(e, 'draft');
                        }}
                    >
                        <Save className="size-4" />
                        Simpan Draft
                    </Button>

                    {/* Next Step Button (jika belum di step terakhir) */}
                    {currentStep < totalSteps && (
                        <Button
                            type="button"
                            className="border-2 border-foreground font-bold shadow-xs active:translate-x-0.5 active:translate-y-0.5"
                            onClick={() => setCurrentStep((s) => Math.min(totalSteps, s + 1))}
                        >
                            Selanjutnya
                            <ArrowRight className="size-4" />
                        </Button>
                    )}

                    {/* Submit Button (di step terakhir atau bisa juga submit langsung) */}
                    <Button
                        type="submit"
                        className={`border-2 border-foreground font-black shadow-xs active:translate-x-0.5 active:translate-y-0.5 ${
                            currentStep === totalSteps ? 'bg-primary text-primary-foreground' : ''
                        }`}
                        disabled={processing}
                        onClick={() => handleSubmit(undefined, data.status)}
                    >
                        <Send className="size-4" />
                        {processing ? 'Menyimpan...' : submitLabel}
                    </Button>
                </div>
            </div>
        </form>
    );
}
