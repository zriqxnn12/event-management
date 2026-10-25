import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import EventForm from './partials/event-form';
import {
    index as eventsIndex,
    store as eventsStore,
    create as eventsCreate,
} from '@/actions/App/Http/Controllers/Vendor/EventController';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Event', href: eventsIndex().url },
    { title: 'Buat Event Baru', href: eventsCreate().url },
];

export default function CreateEvent() {
    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title="Buat Event Baru" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon" className="border-2 border-foreground shadow-xs">
                        <Link href={eventsIndex().url}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Buat Event Baru</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Lengkapi informasi event, tiket, kupon, agenda, dan speaker.
                        </p>
                    </div>
                </div>

                <EventForm
                    action={eventsStore().url}
                    method="post"
                    submitLabel="Simpan Event"
                />
            </div>
        </>
    );
}

CreateEvent.layout = {
    breadcrumbs,
};
