import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import InputError from '@/components/input-error';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    CalendarDays,
    MapPin,
    Monitor,
    Globe,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
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
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type TicketRow = {
    _key: string;
    name: string;
    description: string;
    type: 'free' | 'paid';
    price: string;
    quota: string;
    sale_start: string;
    sale_end: string;
    perks: string[];
    is_active: boolean;
};

export type CouponRow = {
    _key: string;
    code: string;
    description: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: string;
    max_discount_amount: string;
    max_uses: string;
    max_uses_per_user: string;
    minimum_purchase: string;
    valid_from: string;
    valid_until: string;
    is_active: boolean;
};

export type AgendaRow = {
    _key: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    speaker_name: string;
    date: string;
};

export type SpeakerRow = {
    _key: string;
    name: string;
    title: string;
    company: string;
    bio: string;
    linkedin_url: string;
    twitter_url: string;
};

export type SponsorRow = {
    _key: string;
    name: string;
    website_url: string;
    tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'partner';
};

export type EventFormData = {
    title: string;
    description: string;
    category: string;
    type: 'online' | 'offline' | 'hybrid';
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    start_date: string;
    end_date: string;
    registration_start: string;
    registration_end: string;
    max_attendees: string;
    location_name: string;
    location_address: string;
    location_maps_url: string;
    online_platform: string;
    online_url: string;
    online_url_protected: boolean;
    online_url_password: string;
    cover_image: File | null;
    tags: string[];
    tickets: TicketRow[];
    coupons: CouponRow[];
    agendas: AgendaRow[];
    speakers: SpeakerRow[];
    sponsors: SponsorRow[];
};

type Props = {
    initialData?: Partial<EventFormData>;
    action: string;
    method: 'post' | 'put' | 'patch';
    submitLabel?: string;
};

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
    linkedin_url: '', twitter_url: '',
});

const defaultSponsor = (): SponsorRow => ({
    _key: uid(), name: '', website_url: '', tier: 'partner',
});

// ─── Section Wrapper ─────────────────────────────────────────────────────────

function Section({
    icon: Icon,
    title,
    description,
    children,
    defaultOpen = true,
}: {
    icon: React.ElementType;
    title: string;
    description?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-2 border-foreground">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-3 bg-muted/30 px-5 py-4 text-left hover:bg-muted/50"
            >
                <div className="flex items-center gap-3">
                    <Icon className="size-5 shrink-0 text-primary" />
                    <div>
                        <p className="font-black">{title}</p>
                        {description && <p className="text-xs text-muted-foreground font-normal">{description}</p>}
                    </div>
                </div>
                {open ? <ChevronUp className="size-4 shrink-0" /> : <ChevronDown className="size-4 shrink-0" />}
            </button>
            {open && <div className="px-5 py-5">{children}</div>}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EventForm({ initialData = {}, action, method, submitLabel = 'Simpan Event' }: Props) {
    const [tagInput, setTagInput] = useState('');
    const [perkInputs, setPerkInputs] = useState<Record<string, string>>({});

    const { data, setData, submit, processing, errors } = useForm<EventFormData>({
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

    const handleSubmit = (e: React.FormEvent, statusOverride?: string) => {
        e.preventDefault();
        const formData = statusOverride ? { ...data, status: statusOverride as EventFormData['status'] } : data;
        submit(method, action, {
            forceFormData: true,
            data: formData,
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
        setData(field, (data[field] as (T & { _key: string })[]).map((item) =>
            item._key === key ? { ...item, ...patch } : item
        ) as EventFormData[typeof field]);
    };

    const removeItem = (field: keyof EventFormData, key: string) => {
        setData(field, (data[field] as { _key: string }[]).filter((i) => i._key !== key) as EventFormData[typeof field]);
    };

    const isOffline = data.type === 'offline' || data.type === 'hybrid';
    const isOnline = data.type === 'online' || data.type === 'hybrid';

    return (
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="flex flex-col gap-4">
            {/* ── Section: Informasi Dasar ── */}
            <Section icon={CalendarDays} title="Informasi Dasar" description="Judul, deskripsi, kategori, dan tipe event">
                <div className="grid gap-5 sm:grid-cols-2">
                    {/* Title */}
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                        <Label htmlFor="title" className="font-bold">Judul Event <span className="text-destructive">*</span></Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Contoh: Tech Conference 2026"
                            className="border-2 border-foreground/40 focus:border-foreground"
                        />
                        <InputError message={errors.title} />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                        <Label htmlFor="description" className="font-bold">Deskripsi</Label>
                        <textarea
                            id="description"
                            rows={4}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Deskripsikan event Anda..."
                            className="w-full resize-y border-2 border-foreground/40 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                        />
                        <InputError message={errors.description} />
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="font-bold">Kategori <span className="text-destructive">*</span></Label>
                        <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                            <SelectTrigger className="border-2 border-foreground/40 focus:border-foreground">
                                <SelectValue placeholder="Pilih kategori..." />
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
                        <Label className="font-bold">Tipe Event <span className="text-destructive">*</span></Label>
                        <div className="flex gap-2">
                            {(['offline', 'online', 'hybrid'] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setData('type', t)}
                                    className={`flex-1 border-2 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                                        data.type === t
                                            ? 'border-foreground bg-foreground text-background'
                                            : 'border-foreground/30 text-muted-foreground hover:border-foreground'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <InputError message={errors.type} />
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="font-bold">Status</Label>
                        <Select value={data.status} onValueChange={(v) => setData('status', v as EventFormData['status'])}>
                            <SelectTrigger className="border-2 border-foreground/40 focus:border-foreground">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-2 border-foreground">
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                <SelectItem value="completed">Selesai</SelectItem>
                            </SelectContent>
                        </Select>
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
                            placeholder="Kosongkan = tidak terbatas"
                            className="border-2 border-foreground/40 focus:border-foreground"
                        />
                        <InputError message={errors.max_attendees} />
                    </div>

                    {/* Tags */}
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                        <Label className="font-bold">Tags</Label>
                        <div className="flex gap-2">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                placeholder="Ketik tag lalu Enter..."
                                className="border-2 border-foreground/40 focus:border-foreground"
                            />
                            <Button type="button" variant="outline" className="border-2 border-foreground font-bold" onClick={addTag}>
                                <Plus className="size-4" />
                            </Button>
                        </div>
                        {data.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {data.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="border border-foreground/30 font-semibold">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 rounded-full hover:text-destructive">
                                            <X className="size-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cover image */}
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                        <Label htmlFor="cover_image" className="font-bold">Cover Image</Label>
                        <input
                            id="cover_image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('cover_image', e.target.files?.[0] ?? null)}
                            className="w-full border-2 border-foreground/40 bg-background px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-bold hover:border-foreground"
                        />
                        <p className="text-xs text-muted-foreground">Format: JPG, PNG, WEBP. Maks 5 MB.</p>
                        <InputError message={errors.cover_image as string} />
                    </div>
                </div>
            </Section>

            {/* ── Section: Tanggal & Waktu ── */}
            <Section icon={CalendarDays} title="Tanggal & Waktu" description="Jadwal pelaksanaan dan pendaftaran event">
                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="start_date" className="font-bold">Tanggal & Jam Mulai <span className="text-destructive">*</span></Label>
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
                        <Label htmlFor="end_date" className="font-bold">Tanggal & Jam Selesai <span className="text-destructive">*</span></Label>
                        <Input
                            id="end_date"
                            type="datetime-local"
                            value={data.end_date}
                            onChange={(e) => setData('end_date', e.target.value)}
                            className="border-2 border-foreground/40 focus:border-foreground"
                        />
                        <InputError message={errors.end_date} />
                    </div>

                    <Separator className="sm:col-span-2 bg-foreground/15" />

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
            </Section>

            {/* ── Section: Lokasi (offline/hybrid) ── */}
            {isOffline && (
                <Section icon={MapPin} title="Lokasi" description="Informasi tempat penyelenggaraan event offline">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="location_name" className="font-bold">Nama Lokasi <span className="text-destructive">*</span></Label>
                            <Input
                                id="location_name"
                                value={data.location_name}
                                onChange={(e) => setData('location_name', e.target.value)}
                                placeholder="Contoh: Jakarta Convention Center"
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
                                    placeholder="https://maps.google.com/..."
                                    className="border-2 border-foreground/40 pr-9 focus:border-foreground"
                                />
                                {data.location_maps_url && (
                                    <a
                                        href={data.location_maps_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute right-2 text-muted-foreground hover:text-foreground"
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
                                placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota..."
                                className="w-full resize-y border-2 border-foreground/40 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                            />
                            <InputError message={errors.location_address} />
                        </div>
                    </div>
                </Section>
            )}

            {/* ── Section: Link Online (online/hybrid) ── */}
            {isOnline && (
                <Section icon={Monitor} title="Link Online" description="Platform dan link streaming/meeting untuk event online">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label className="font-bold">Platform</Label>
                            <Select value={data.online_platform} onValueChange={(v) => setData('online_platform', v)}>
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
                            <Label htmlFor="online_url" className="font-bold">Link Meeting/Streaming</Label>
                            <Input
                                id="online_url"
                                type="url"
                                value={data.online_url}
                                onChange={(e) => setData('online_url', e.target.value)}
                                placeholder="https://zoom.us/j/..."
                                className="border-2 border-foreground/40 focus:border-foreground"
                            />
                            <InputError message={errors.online_url} />
                        </div>

                        <div className="sm:col-span-2 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setData('online_url_protected', !data.online_url_protected)}
                                    className={`flex items-center gap-2 border-2 px-3 py-2 text-xs font-bold transition-all ${
                                        data.online_url_protected
                                            ? 'border-foreground bg-foreground text-background'
                                            : 'border-foreground/30 text-muted-foreground hover:border-foreground'
                                    }`}
                                >
                                    {data.online_url_protected ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
                                    {data.online_url_protected ? 'Link Terproteksi (Password)' : 'Aktifkan Password Link'}
                                </button>
                            </div>

                            {data.online_url_protected && (
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="online_url_password" className="font-bold">Password Link</Label>
                                    <Input
                                        id="online_url_password"
                                        type="text"
                                        value={data.online_url_password}
                                        onChange={(e) => setData('online_url_password', e.target.value)}
                                        placeholder="Password yang akan diberikan ke peserta terdaftar"
                                        className="border-2 border-foreground/40 focus:border-foreground"
                                    />
                                    <InputError message={errors.online_url_password} />
                                </div>
                            )}
                        </div>
                    </div>
                </Section>
            )}

            {/* ── Section: Tiket ── */}
            <Section
                icon={Ticket}
                title="Konfigurasi Tiket"
                description="Atur tipe tiket, harga, kuota, dan periode penjualan"
                defaultOpen={false}
            >
                <div className="flex flex-col gap-4">
                    {data.tickets.map((ticket, idx) => (
                        <div key={ticket._key} className="border-2 border-foreground/30 p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="font-black text-sm">Tiket #{idx + 1}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-destructive hover:text-destructive"
                                    onClick={() => removeItem('tickets', ticket._key)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Nama Tiket <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={ticket.name}
                                        onChange={(e) => updateTicket(ticket._key, 'name', e.target.value)}
                                        placeholder="Reguler / VIP / VVIP"
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                    <InputError message={(errors as Record<string, string>)[`tickets.${idx}.name`]} />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Tipe</Label>
                                    <div className="flex gap-2">
                                        {(['free', 'paid'] as const).map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => updateTicket(ticket._key, 'type', t)}
                                                className={`flex-1 border-2 py-1.5 text-xs font-bold uppercase transition-all ${
                                                    ticket.type === t
                                                        ? 'border-foreground bg-foreground text-background'
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
                                        <Label className="font-bold text-xs">Harga (Rp) <span className="text-destructive">*</span></Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={ticket.price}
                                            onChange={(e) => updateTicket(ticket._key, 'price', e.target.value)}
                                            placeholder="150000"
                                            className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                        />
                                        <InputError message={(errors as Record<string, string>)[`tickets.${idx}.price`]} />
                                    </div>
                                )}

                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Kuota</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={ticket.quota}
                                        onChange={(e) => updateTicket(ticket._key, 'quota', e.target.value)}
                                        placeholder="Kosongkan = tidak terbatas"
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Penjualan Dibuka</Label>
                                    <Input
                                        type="datetime-local"
                                        value={ticket.sale_start}
                                        onChange={(e) => updateTicket(ticket._key, 'sale_start', e.target.value)}
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Penjualan Ditutup</Label>
                                    <Input
                                        type="datetime-local"
                                        value={ticket.sale_end}
                                        onChange={(e) => updateTicket(ticket._key, 'sale_end', e.target.value)}
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>

                                <div className="sm:col-span-2 flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Deskripsi</Label>
                                    <Input
                                        value={ticket.description}
                                        onChange={(e) => updateTicket(ticket._key, 'description', e.target.value)}
                                        placeholder="Keuntungan atau catatan untuk tiket ini..."
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>

                                {/* Perks */}
                                <div className="sm:col-span-2 flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Keuntungan / Perks</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={perkInputs[ticket._key] || ''}
                                            onChange={(e) => setPerkInputs((p) => ({ ...p, [ticket._key]: e.target.value }))}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPerk(ticket._key); } }}
                                            placeholder="Contoh: Akses semua sesi, Sertifikat..."
                                            className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                        />
                                        <Button type="button" variant="outline" size="icon" className="border-2 border-foreground" onClick={() => addPerk(ticket._key)}>
                                            <Plus className="size-4" />
                                        </Button>
                                    </div>
                                    {ticket.perks.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {ticket.perks.map((perk, pi) => (
                                                <Badge key={pi} variant="secondary" className="border border-foreground/20 text-xs font-semibold">
                                                    {perk}
                                                    <button type="button" onClick={() => removePerk(ticket._key, pi)} className="ml-1.5 hover:text-destructive">
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

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-2 border-dashed border-foreground/40 font-bold hover:border-foreground"
                        onClick={() => setData('tickets', [...data.tickets, defaultTicket()])}
                    >
                        <Plus className="size-4" /> Tambah Tipe Tiket
                    </Button>
                </div>
            </Section>

            {/* ── Section: Kupon ── */}
            <Section
                icon={Tag}
                title="Kupon & Promo"
                description="Buat kode diskon untuk event ini"
                defaultOpen={false}
            >
                <div className="flex flex-col gap-4">
                    {data.coupons.map((coupon, idx) => (
                        <div key={coupon._key} className="border-2 border-foreground/30 p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="font-black text-sm">Kupon #{idx + 1}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-destructive hover:text-destructive"
                                    onClick={() => removeItem('coupons', coupon._key)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Kode Kupon <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={coupon.code}
                                        onChange={(e) => updateItem<CouponRow>('coupons', coupon._key, { code: e.target.value.toUpperCase() })}
                                        placeholder="PROMO20 / EARLYBIRD"
                                        className="border-2 border-foreground/40 focus:border-foreground font-mono text-sm uppercase"
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
                                                        ? 'border-foreground bg-foreground text-background'
                                                        : 'border-foreground/30 text-muted-foreground hover:border-foreground'
                                                }`}
                                            >
                                                {t === 'percentage' ? 'Persentase (%)' : 'Potongan Harga (Rp)'}
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
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
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
                                            placeholder="Kosongkan = tanpa batas"
                                            className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                        />
                                    </div>
                                )}

                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Batas Penggunaan Total</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={coupon.max_uses}
                                        onChange={(e) => updateItem<CouponRow>('coupons', coupon._key, { max_uses: e.target.value })}
                                        placeholder="Kosongkan = tidak terbatas"
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Maks. Penggunaan / User</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={coupon.max_uses_per_user}
                                        onChange={(e) => updateItem<CouponRow>('coupons', coupon._key, { max_uses_per_user: e.target.value })}
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Min. Pembelian (Rp)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={coupon.minimum_purchase}
                                        onChange={(e) => updateItem<CouponRow>('coupons', coupon._key, { minimum_purchase: e.target.value })}
                                        placeholder="Kosongkan = tanpa minimum"
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Berlaku Dari</Label>
                                    <Input
                                        type="datetime-local"
                                        value={coupon.valid_from}
                                        onChange={(e) => updateItem<CouponRow>('coupons', coupon._key, { valid_from: e.target.value })}
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Berlaku Hingga</Label>
                                    <Input
                                        type="datetime-local"
                                        value={coupon.valid_until}
                                        onChange={(e) => updateItem<CouponRow>('coupons', coupon._key, { valid_until: e.target.value })}
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>

                                <div className="sm:col-span-2 flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Deskripsi Kupon</Label>
                                    <Input
                                        value={coupon.description}
                                        onChange={(e) => updateItem<CouponRow>('coupons', coupon._key, { description: e.target.value })}
                                        placeholder="Contoh: Diskon early bird khusus member"
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-2 border-dashed border-foreground/40 font-bold hover:border-foreground"
                        onClick={() => setData('coupons', [...data.coupons, defaultCoupon()])}
                    >
                        <Plus className="size-4" /> Tambah Kupon
                    </Button>
                </div>
            </Section>

            {/* ── Section: Agenda / Rundown ── */}
            <Section
                icon={CalendarDays}
                title="Agenda / Rundown"
                description="Susun jadwal sesi dan kegiatan selama event"
                defaultOpen={false}
            >
                <div className="flex flex-col gap-3">
                    {data.agendas.map((agenda, idx) => (
                        <div key={agenda._key} className="border-2 border-foreground/30 p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="font-black text-sm">Sesi #{idx + 1}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-destructive hover:text-destructive"
                                    onClick={() => removeItem('agendas', agenda._key)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="sm:col-span-2 flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Judul Sesi <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={agenda.title}
                                        onChange={(e) => updateItem<AgendaRow>('agendas', agenda._key, { title: e.target.value })}
                                        placeholder="Opening Ceremony / Keynote / Workshop..."
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                    <InputError message={(errors as Record<string, string>)[`agendas.${idx}.title`]} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Tanggal (Multi-hari)</Label>
                                    <Input
                                        type="date"
                                        value={agenda.date}
                                        onChange={(e) => updateItem<AgendaRow>('agendas', agenda._key, { date: e.target.value })}
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Jam Mulai <span className="text-destructive">*</span></Label>
                                    <Input
                                        type="time"
                                        value={agenda.start_time}
                                        onChange={(e) => updateItem<AgendaRow>('agendas', agenda._key, { start_time: e.target.value })}
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                    <InputError message={(errors as Record<string, string>)[`agendas.${idx}.start_time`]} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Jam Selesai</Label>
                                    <Input
                                        type="time"
                                        value={agenda.end_time}
                                        onChange={(e) => updateItem<AgendaRow>('agendas', agenda._key, { end_time: e.target.value })}
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Pembicara</Label>
                                    <Input
                                        value={agenda.speaker_name}
                                        onChange={(e) => updateItem<AgendaRow>('agendas', agenda._key, { speaker_name: e.target.value })}
                                        placeholder="Nama pembicara / host..."
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>
                                <div className="sm:col-span-3 flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Keterangan</Label>
                                    <Input
                                        value={agenda.description}
                                        onChange={(e) => updateItem<AgendaRow>('agendas', agenda._key, { description: e.target.value })}
                                        placeholder="Deskripsi singkat sesi..."
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-2 border-dashed border-foreground/40 font-bold hover:border-foreground"
                        onClick={() => setData('agendas', [...data.agendas, defaultAgenda()])}
                    >
                        <Plus className="size-4" /> Tambah Sesi
                    </Button>
                </div>
            </Section>

            {/* ── Section: Speakers ── */}
            <Section
                icon={Mic}
                title="Pembicara (Speakers)"
                description="Tambahkan daftar narasumber atau pembicara"
                defaultOpen={false}
            >
                <div className="flex flex-col gap-4">
                    {data.speakers.map((speaker, idx) => (
                        <div key={speaker._key} className="border-2 border-foreground/30 p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="font-black text-sm">Pembicara #{idx + 1}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-destructive hover:text-destructive"
                                    onClick={() => removeItem('speakers', speaker._key)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Nama <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={speaker.name}
                                        onChange={(e) => updateItem<SpeakerRow>('speakers', speaker._key, { name: e.target.value })}
                                        placeholder="Nama lengkap pembicara"
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                    <InputError message={(errors as Record<string, string>)[`speakers.${idx}.name`]} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Jabatan / Posisi</Label>
                                    <Input
                                        value={speaker.title}
                                        onChange={(e) => updateItem<SpeakerRow>('speakers', speaker._key, { title: e.target.value })}
                                        placeholder="CEO / Co-Founder / Head of..."
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Perusahaan / Institusi</Label>
                                    <Input
                                        value={speaker.company}
                                        onChange={(e) => updateItem<SpeakerRow>('speakers', speaker._key, { company: e.target.value })}
                                        placeholder="Nama perusahaan"
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">LinkedIn</Label>
                                    <Input
                                        type="url"
                                        value={speaker.linkedin_url}
                                        onChange={(e) => updateItem<SpeakerRow>('speakers', speaker._key, { linkedin_url: e.target.value })}
                                        placeholder="https://linkedin.com/in/..."
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Twitter/X</Label>
                                    <Input
                                        type="url"
                                        value={speaker.twitter_url}
                                        onChange={(e) => updateItem<SpeakerRow>('speakers', speaker._key, { twitter_url: e.target.value })}
                                        placeholder="https://x.com/..."
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>
                                <div className="sm:col-span-2 flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Bio Singkat</Label>
                                    <textarea
                                        rows={2}
                                        value={speaker.bio}
                                        onChange={(e) => updateItem<SpeakerRow>('speakers', speaker._key, { bio: e.target.value })}
                                        placeholder="Perkenalan singkat tentang pembicara..."
                                        className="w-full resize-y border-2 border-foreground/40 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-2 border-dashed border-foreground/40 font-bold hover:border-foreground"
                        onClick={() => setData('speakers', [...data.speakers, defaultSpeaker()])}
                    >
                        <Plus className="size-4" /> Tambah Pembicara
                    </Button>
                </div>
            </Section>

            {/* ── Section: Sponsors ── */}
            <Section
                icon={Building2}
                title="Sponsor"
                description="Daftarkan sponsor dan mitra pendukung event"
                defaultOpen={false}
            >
                <div className="flex flex-col gap-4">
                    {data.sponsors.map((sponsor, idx) => (
                        <div key={sponsor._key} className="border-2 border-foreground/30 p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="font-black text-sm">Sponsor #{idx + 1}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-destructive hover:text-destructive"
                                    onClick={() => removeItem('sponsors', sponsor._key)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Nama Sponsor <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={sponsor.name}
                                        onChange={(e) => updateItem<SponsorRow>('sponsors', sponsor._key, { name: e.target.value })}
                                        placeholder="Nama perusahaan/brand"
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                    <InputError message={(errors as Record<string, string>)[`sponsors.${idx}.name`]} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label className="font-bold text-xs">Tier</Label>
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
                                    <Label className="font-bold text-xs">Website</Label>
                                    <Input
                                        type="url"
                                        value={sponsor.website_url}
                                        onChange={(e) => updateItem<SponsorRow>('sponsors', sponsor._key, { website_url: e.target.value })}
                                        placeholder="https://example.com"
                                        className="border-2 border-foreground/40 focus:border-foreground text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-2 border-dashed border-foreground/40 font-bold hover:border-foreground"
                        onClick={() => setData('sponsors', [...data.sponsors, defaultSponsor()])}
                    >
                        <Plus className="size-4" /> Tambah Sponsor
                    </Button>
                </div>
            </Section>

            {/* ── Submit bar ── */}
            <div className="sticky bottom-0 z-40 flex items-center justify-between gap-4 border-t-2 border-foreground bg-background/95 px-5 py-4 backdrop-blur-md">
                <p className="text-xs text-muted-foreground">
                    Simpan sebagai draft untuk melanjutkan nanti, atau publish langsung.
                </p>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-2 border-foreground font-bold shadow-xs"
                        disabled={processing}
                        onClick={(e) => {
                            setData('status', 'draft');
                            handleSubmit(e as React.FormEvent, 'draft');
                        }}
                    >
                        <Save className="size-4" />
                        Simpan Draft
                    </Button>
                    <Button
                        type="button"
                        className="border-2 border-foreground font-bold shadow-xs"
                        disabled={processing}
                        onClick={(e) => {
                            setData('status', 'published');
                            handleSubmit(e as React.FormEvent, 'published');
                        }}
                    >
                        <Send className="size-4" />
                        {processing ? 'Menyimpan...' : submitLabel}
                    </Button>
                </div>
            </div>
        </form>
    );
}
