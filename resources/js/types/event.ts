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
