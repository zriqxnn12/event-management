import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    CalendarDays,
    MapPin,
    Users,
    Music,
    Palette,
    GraduationCap,
    Laptop,
    Briefcase,
    Trophy,
    Utensils,
} from 'lucide-react';
import type { VendorProfileEvent } from '@/types/event';
import { cn } from '@/lib/utils';

export function getCategoryIcon(category?: string | null) {
    const cat = (category || '').toLowerCase();
    if (cat.includes('musik') || cat.includes('music') || cat.includes('konser')) return Music;
    if (cat.includes('design') || cat.includes('seni') || cat.includes('art') || cat.includes('workshop')) return Palette;
    if (cat.includes('edukasi') || cat.includes('pendidikan') || cat.includes('kursus') || cat.includes('seminar')) return GraduationCap;
    if (cat.includes('tech') || cat.includes('coding') || cat.includes('teknologi') || cat.includes('programming')) return Laptop;
    if (cat.includes('bisnis') || cat.includes('karir') || cat.includes('business')) return Briefcase;
    if (cat.includes('olahraga') || cat.includes('sport') || cat.includes('game')) return Trophy;
    if (cat.includes('kuliner') || cat.includes('food')) return Utensils;
    return CalendarDays;
}

export interface EventCardProps {
    event: VendorProfileEvent;
    vendorUsername?: string;
    href?: string;
    actionLabel?: string;
    className?: string;
}

export function EventCard({
    event,
    vendorUsername,
    href,
    actionLabel = 'Daftar Sekarang',
    className,
}: EventCardProps) {
    const IconComponent = getCategoryIcon(event.category);
    const isUpcoming = event.isUpcoming;
    const eventUrl = href ?? (vendorUsername ? `/${vendorUsername}/${event.slug}` : `/${event.slug}`);

    return (
        <Card className={cn('group flex flex-col justify-between overflow-hidden border-2 border-foreground transition-all duration-200 hover:-translate-y-1 hover:shadow-lg', className)}>
            <div>
                {/* Event visual banner */}
                <Link
                    href={eventUrl}
                    className={`relative block h-44 overflow-hidden border-b-2 border-foreground ${
                        isUpcoming ? 'bg-secondary/40' : 'bg-muted/60'
                    }`}
                >
                    {event.cover_image ? (
                        <img
                            src={`/storage/${event.cover_image}`}
                            alt={event.title}
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <IconComponent className="size-16 text-foreground/15" />
                        </div>
                    )}

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <Badge
                            variant={isUpcoming ? 'default' : 'secondary'}
                            className="border-2 border-foreground text-xs font-black shadow-2xs"
                        >
                            {isUpcoming ? 'Upcoming' : 'Selesai'}
                        </Badge>
                        <Badge
                            variant="secondary"
                            className="border-2 border-foreground text-[10px] font-black uppercase shadow-2xs"
                        >
                            {event.type === 'online' ? 'Online' : 'Offline'}
                        </Badge>
                    </div>

                    <div className="absolute top-3 right-3">
                        <Badge
                            variant="outline"
                            className="border-2 border-foreground bg-background/95 text-xs font-bold backdrop-blur-xs shadow-2xs"
                        >
                            {event.category || (event.type === 'online' ? 'Webinar' : 'Acara')}
                        </Badge>
                    </div>
                </Link>

                <CardHeader className="pb-2 mt-4">
                    <CardTitle className="line-clamp-2 text-base font-black leading-snug">
                        <Link href={eventUrl} className="hover:text-primary transition-colors">
                            {event.title}
                        </Link>
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="size-3.5 shrink-0 text-primary" />
                            <span className="font-semibold">{event.date || 'Jadwal segera hadir'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="size-3.5 shrink-0 text-primary" />
                            <span className="truncate">{event.location || (event.type === 'online' ? 'Online' : 'Lokasi segera diumumkan')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="size-3.5 shrink-0 text-primary" />
                            <span>
                                {event.attendees > 0
                                    ? `${event.attendees.toLocaleString('id-ID')} kuota peserta`
                                    : 'Peserta umum'}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </div>

            <CardContent className="pt-0">
                <Separator className="mb-3 bg-foreground/15" />
                <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-black text-foreground">
                        {event.price}
                    </span>
                    <Button
                        asChild
                        size="sm"
                        variant="default"
                        className="border-2 border-foreground text-xs font-bold shadow-2xs hover:shadow-xs transition-shadow"
                    >
                        <Link href={eventUrl}>
                            {actionLabel}
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default EventCard;
