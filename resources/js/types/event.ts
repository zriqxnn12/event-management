export type EventType = 'online' | 'offline' | 'hybrid';

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export type Event = {
    id: number;
    title: string;
    slug: string;
    category: string;
    type: EventType;
    status: EventStatus;
    start_date: string;
    end_date: string;
    location_name?: string | null;
    online_platform?: string | null;
    max_attendees?: number | null;
    cover_image?: string | null;
    tickets_count: number;
    coupons_count: number;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

export type PaginatedEvents = PaginatedData<Event>;

export type EventsIndexProps = {
    events: PaginatedEvents;
    filters: { status: string };
};

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
    avatar?: File | string | null;
    linkedin_url: string;
    twitter_url: string;
};

export type SponsorRow = {
    _key: string;
    name: string;
    logo?: File | string | null;
    website_url: string;
    tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'partner';
};

export type EventFormData = {
    title: string;
    description: string;
    category: string;
    type: EventType;
    status: EventStatus;
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

export type EventFormProps = {
    initialData?: Partial<EventFormData>;
    action: string;
    method: 'post' | 'put' | 'patch';
    submitLabel?: string;
    existingCoverImage?: string | null;
};

// ─── Vendor Profile ───────────────────────────────────────────────────────────────

export type SocialMediaItem = {
    id?: string;
    platform: string;
    url: string;
    handle?: string | null;
};

export type Vendor = {
    id: number;
    name: string;
    username: string;
    avatar?: string | null;
    about?: string | null;
    role: string;
    memberSince: string;
    socialMedia?: SocialMediaItem[];
    totalEvents?: number;
};

export type VendorProfileEvent = {
    id: number;
    title: string;
    slug?: string;
    description?: string | null;
    category?: string | null;
    type: 'online' | 'offline';
    status: string;
    isUpcoming: boolean;
    date: string;
    start_date?: string | null;
    end_date?: string | null;
    location: string;
    attendees: number;
    price: string;
    cover_image?: string | null;
};

export type VendorProfileStats = {
    totalEvents: number;
    totalAttendees: number;
};

export type VendorProfileProps = {
    vendor: Vendor;
    events?: VendorProfileEvent[];
    stats?: VendorProfileStats;
};

// ─── Public Event Detail ─────────────────────────────────────────────────────────

export type PublicTicket = {
    id: number;
    name: string;
    description: string | null;
    type: 'free' | 'paid';
    price: number;
    formatted_price: string;
    quota: number | null;
    sold: number;
    remaining_quota: number | null;
    perks: string[];
    is_active: boolean;
    is_on_sale: boolean;
    is_sold_out: boolean;
    sale_start: string | null;
    sale_end: string | null;
};

export type PublicAgenda = {
    id: number;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string | null;
    speaker_name: string | null;
    date: string | null;
};

export type PublicSpeaker = {
    id: number;
    name: string;
    title: string | null;
    company: string | null;
    bio: string | null;
    avatar: string | null;
    linkedin_url: string | null;
    twitter_url: string | null;
};

export type PublicSponsor = {
    id: number;
    name: string;
    tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'partner';
    website_url: string | null;
    logo: string | null;
};

export type PublicEventDetail = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    category: string;
    type: EventType;
    status: EventStatus;
    isUpcoming: boolean;
    isRegistrationOpen: boolean;
    date: string;
    time: string;
    start_date: string | null;
    end_date: string | null;
    registration_start: string | null;
    registration_end: string | null;
    location_name: string | null;
    location_address: string | null;
    location_maps_url: string | null;
    online_platform: string | null;
    online_url: string | null;
    online_url_protected: boolean;
    max_attendees: number | null;
    cover_image: string | null;
    tags: string[];
    price_display: string;
    tickets: PublicTicket[];
    agendas: PublicAgenda[];
    speakers: PublicSpeaker[];
    sponsors: PublicSponsor[];
};

export type EventDetailPageProps = {
    event: PublicEventDetail;
    vendor: Vendor;
    otherEvents?: VendorProfileEvent[];
    isPreview?: boolean;
};

