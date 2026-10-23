import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import EventForm, { type EventFormData } from './partials/event-form';
import {
    index as eventsIndex,
    update as eventsUpdate,
    edit as eventsEdit,
} from '@/actions/App/Http/Controllers/Vendor/EventController';
import type { BreadcrumbItem } from '@/types';

type EventData = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    category: string;
    type: 'online' | 'offline' | 'hybrid';
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    start_date: string;
    end_date: string;
    registration_start: string | null;
    registration_end: string | null;
    max_attendees: number | null;
    location_name: string | null;
    location_address: string | null;
    location_maps_url: string | null;
    online_platform: string | null;
    online_url: string | null;
    online_url_protected: boolean;
    online_url_password: string | null;
    cover_image: string | null;
    tags: string[] | null;
    tickets: {
        id: number; name: string; description: string | null; type: 'free' | 'paid';
        price: string; quota: number | null; sale_start: string | null; sale_end: string | null;
        perks: string[] | null; is_active: boolean;
    }[];
    coupons: {
        id: number; code: string; description: string | null; discount_type: 'percentage' | 'fixed';
        discount_value: string; max_discount_amount: string | null; max_uses: number | null;
        max_uses_per_user: number; minimum_purchase: string | null;
        valid_from: string | null; valid_until: string | null; is_active: boolean;
    }[];
    agendas: {
        id: number; title: string; description: string | null;
        start_time: string; end_time: string | null; speaker_name: string | null; date: string | null;
    }[];
    speakers: {
        id: number; name: string; title: string | null; company: string | null;
        bio: string | null; linkedin_url: string | null; twitter_url: string | null;
    }[];
    sponsors: {
        id: number; name: string; website_url: string | null;
        tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'partner';
    }[];
};

type Props = { event: EventData };

function toDatetimeLocal(val: string | null | undefined): string {
    if (!val) return '';
    // Convert "2026-11-15 09:00:00" → "2026-11-15T09:00"
    return val.replace(' ', 'T').slice(0, 16);
}

function buildInitialData(event: EventData): Partial<EventFormData> {
    const uid = (id: number) => `_existing_${id}`;
    return {
        title: event.title,
        description: event.description ?? '',
        category: event.category,
        type: event.type,
        status: event.status,
        start_date: toDatetimeLocal(event.start_date),
        end_date: toDatetimeLocal(event.end_date),
        registration_start: toDatetimeLocal(event.registration_start),
        registration_end: toDatetimeLocal(event.registration_end),
        max_attendees: event.max_attendees?.toString() ?? '',
        location_name: event.location_name ?? '',
        location_address: event.location_address ?? '',
        location_maps_url: event.location_maps_url ?? '',
        online_platform: event.online_platform ?? '',
        online_url: event.online_url ?? '',
        online_url_protected: event.online_url_protected,
        online_url_password: event.online_url_password ?? '',
        cover_image: null,
        tags: event.tags ?? [],
        tickets: event.tickets.map((t) => ({
            _key: uid(t.id),
            name: t.name,
            description: t.description ?? '',
            type: t.type,
            price: t.price,
            quota: t.quota?.toString() ?? '',
            sale_start: toDatetimeLocal(t.sale_start),
            sale_end: toDatetimeLocal(t.sale_end),
            perks: t.perks ?? [],
            is_active: t.is_active,
        })),
        coupons: event.coupons.map((c) => ({
            _key: uid(c.id),
            code: c.code,
            description: c.description ?? '',
            discount_type: c.discount_type,
            discount_value: c.discount_value,
            max_discount_amount: c.max_discount_amount ?? '',
            max_uses: c.max_uses?.toString() ?? '',
            max_uses_per_user: c.max_uses_per_user.toString(),
            minimum_purchase: c.minimum_purchase ?? '',
            valid_from: toDatetimeLocal(c.valid_from),
            valid_until: toDatetimeLocal(c.valid_until),
            is_active: c.is_active,
        })),
        agendas: event.agendas.map((a) => ({
            _key: uid(a.id),
            title: a.title,
            description: a.description ?? '',
            start_time: a.start_time?.slice(0, 5) ?? '',
            end_time: a.end_time?.slice(0, 5) ?? '',
            speaker_name: a.speaker_name ?? '',
            date: a.date ?? '',
        })),
        speakers: event.speakers.map((s) => ({
            _key: uid(s.id),
            name: s.name,
            title: s.title ?? '',
            company: s.company ?? '',
            bio: s.bio ?? '',
            linkedin_url: s.linkedin_url ?? '',
            twitter_url: s.twitter_url ?? '',
        })),
        sponsors: event.sponsors.map((sp) => ({
            _key: uid(sp.id),
            name: sp.name,
            website_url: sp.website_url ?? '',
            tier: sp.tier,
        })),
    };
}

export default function EditEvent({ event }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Event', href: eventsIndex().url },
        { title: event.title, href: eventsEdit({ event: event.id }).url },
    ];

    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title={`Edit: ${event.title}`} />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon" className="border-2 border-foreground shadow-xs">
                        <Link href={eventsIndex().url}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Edit Event</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                            {event.title}
                        </p>
                    </div>
                </div>

                <EventForm
                    initialData={buildInitialData(event)}
                    action={eventsUpdate({ event: event.id }).url}
                    method="put"
                    submitLabel="Perbarui Event"
                />
            </div>
        </>
    );
}
