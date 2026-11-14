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
    user?: { id: number; name: string; username: string } | null;
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

// ─── Orders ──────────────────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'paid' | 'expired' | 'cancelled';

export type OrderRow = {
    id: number;
    number: string;
    attendee_name: string;
    attendee_email: string;
    attendee_phone: string | null;
    quantity: number;
    total_price: number;
    formatted_price: string;
    /** Only present when the authenticated user is an admin. */
    platform_fee: number | null;
    /** Only present when the authenticated user is an admin. */
    formatted_fee: string | null;
    payment_status: PaymentStatus;
    created_at: string;
    created_at_human: string;
    event: { id: number; title: string; slug: string } | null;
    ticket: { id: number; name: string } | null;
};

export type EventOption = { id: number; title: string };

export type OrdersFilters = {
    payment_status: string;
    event_id: number | null;
    search: string | null;
};

export type OrdersStats = {
    total_revenue: number;
    total_orders: number;
    total_paid_orders: number;
    total_fee: number | null;
};

export type OrdersIndexProps = {
    orders: PaginatedData<OrderRow>;
    filters: OrdersFilters;
    eventOptions: EventOption[];
    isAdmin: boolean;
    feeRate: number;
    stats: OrdersStats;
};

// ─── Check-in ────────────────────────────────────────────────────────────────

export type CheckInEventOption = {
    id: number;
    title: string;
    start_date: string | null;
    end_date: string | null;
    cover_image: string | null;
    status: string;
    total_orders: number;
    checked_in: number;
};

export type CheckInAttendee = {
    id: number;
    number: string;
    attendee_name: string;
    attendee_email: string;
    attendee_phone: string | null;
    quantity: number;
    is_checked_in: boolean;
    checked_in_at: string | null;
    checked_in_count: number;
    ticket: { id: number; name: string } | null;
    event?: { id: number; title: string } | null;
    total_price: number;
    formatted_price: string;
};

export type CheckInFilters = {
    event_id: number | null;
    search: string | null;
    checked_in: string;
};

export type CheckInIndexProps = {
    events: CheckInEventOption[];
    selectedEvent: { id: number; title: string; start_date: string | null; end_date: string | null; status: string } | null;
    attendees: PaginatedData<CheckInAttendee> | null;
    filters: CheckInFilters;
    isAdmin: boolean;
};

// ─── Withdrawals ─────────────────────────────────────────────────────────────

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export type WithdrawalRow = {
    id: number;
    reference_number: string;
    amount: number;
    formatted_amount: string;
    bank_name: string;
    account_number: string;
    account_name: string;
    status: WithdrawalStatus;
    notes: string | null;
    admin_notes: string | null;
    created_at: string;
    created_at_human: string;
    processed_at: string | null;
    user: { id: number; name: string; email: string; username: string } | null;
    approver: { id: number; name: string } | null;
};

export type WithdrawalFilters = {
    status: string;
    search: string | null;
};

export type WithdrawalStats = {
    available_balance: number | null;
    formatted_available_balance: string | null;
    net_earnings: number | null;
    formatted_net_earnings: string | null;
    gross_revenue?: number;
    formatted_gross_revenue?: string;
    platform_fee?: number;
    formatted_platform_fee?: string;
    total_withdrawn?: number;
    formatted_total_withdrawn?: string;
    pending_amount?: number;
    formatted_pending_amount?: string;
    total_approved_amount?: number;
    formatted_approved_amount?: string;
    total_pending_amount?: number;
    total_rejected_amount?: number;
    formatted_rejected_amount?: string;
    pending_count: number;
    approved_count: number;
    rejected_count: number;
};

export type WithdrawalsIndexProps = {
    withdrawals: PaginatedData<WithdrawalRow>;
    filters: WithdrawalFilters;
    stats: WithdrawalStats;
    isAdmin: boolean;
    minWithdrawalAmount: number;
    formattedMinWithdrawalAmount: string;
};


