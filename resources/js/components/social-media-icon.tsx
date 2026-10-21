import React from 'react';
import {
    Instagram,
    Youtube,
    Facebook,
    Linkedin,
    Github,
    Globe,
    Share2,
    Link as LinkIcon,
} from 'lucide-react';

export type PlatformId =
    | 'instagram'
    | 'tiktok'
    | 'whatsapp'
    | 'youtube'
    | 'twitter'
    | 'facebook'
    | 'linkedin'
    | 'telegram'
    | 'github'
    | 'website';

export type PlatformConfig = {
    id: PlatformId;
    label: string;
    placeholder: string;
    hint: string;
    color: string;
    prefix?: string;
};

export const SUPPORTED_PLATFORMS: PlatformConfig[] = [
    {
        id: 'instagram',
        label: 'Instagram',
        placeholder: 'https://instagram.com/username atau @username',
        hint: 'Masukkan link profil atau username Instagram',
        color: 'hover:text-pink-600',
    },
    {
        id: 'tiktok',
        label: 'TikTok',
        placeholder: 'https://tiktok.com/@username atau @username',
        hint: 'Masukkan link profil atau username TikTok',
        color: 'hover:text-black dark:hover:text-white',
    },
    {
        id: 'whatsapp',
        label: 'WhatsApp',
        placeholder: '081234567890 atau https://wa.me/6281234567890',
        hint: 'Nomor WhatsApp untuk dihubungi langsung',
        color: 'hover:text-emerald-600',
    },
    {
        id: 'youtube',
        label: 'YouTube',
        placeholder: 'https://youtube.com/@channel',
        hint: 'Link channel YouTube Anda',
        color: 'hover:text-red-600',
    },
    {
        id: 'twitter',
        label: 'X (Twitter)',
        placeholder: 'https://x.com/username atau @username',
        hint: 'Link profil atau username X / Twitter',
        color: 'hover:text-foreground',
    },
    {
        id: 'facebook',
        label: 'Facebook',
        placeholder: 'https://facebook.com/namahalaman',
        hint: 'Link halaman atau profil Facebook',
        color: 'hover:text-blue-600',
    },
    {
        id: 'linkedin',
        label: 'LinkedIn',
        placeholder: 'https://linkedin.com/in/username atau /company/nama',
        hint: 'Link profil atau perusahaan LinkedIn',
        color: 'hover:text-blue-700',
    },
    {
        id: 'telegram',
        label: 'Telegram',
        placeholder: 'https://t.me/username atau @username',
        hint: 'Username atau link channel/grup Telegram',
        color: 'hover:text-sky-500',
    },
    {
        id: 'github',
        label: 'GitHub',
        placeholder: 'https://github.com/username',
        hint: 'Link profil GitHub organisasi / vendor',
        color: 'hover:text-foreground',
    },
    {
        id: 'website',
        label: 'Website / Portfolio',
        placeholder: 'https://perusahaan-anda.com',
        hint: 'Website resmi atau portofolio vendor',
        color: 'hover:text-primary',
    },
];

export function getPlatformMeta(platform: string): PlatformConfig {
    const key = (platform || '').toLowerCase().trim();
    const found = SUPPORTED_PLATFORMS.find(
        (p) => p.id === key || (key === 'x' && p.id === 'twitter'),
    );

    return (
        found || {
            id: 'website',
            label: platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Website',
            placeholder: 'https://...',
            hint: 'Link situs atau media sosial',
            color: 'hover:text-primary',
        }
    );
}

export function SocialIcon({
    platform,
    className = 'size-4',
}: {
    platform: string;
    className?: string;
}) {
    const key = (platform || '').toLowerCase().trim();

    if (key === 'instagram') {
        return <Instagram className={className} />;
    }

    if (key === 'tiktok') {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className={className}
                aria-hidden="true"
            >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
            </svg>
        );
    }

    if (key === 'whatsapp') {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className={className}
                aria-hidden="true"
            >
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.24-8.24m-4.53 4.19c-.19 0-.41.01-.6.04-.25.04-.54.14-.76.43-.28.37-1.06 1.04-1.06 2.53s1.09 2.93 1.24 3.13c.15.2 2.11 3.23 5.12 4.53.72.31 1.28.5 1.71.64.72.23 1.38.2 1.9.12.58-.09 1.8-.73 2.05-1.44.25-.71.25-1.32.18-1.44-.07-.12-.27-.2-.58-.35-.31-.15-1.8-.89-2.08-.99-.28-.1-.49-.15-.7.15-.21.3-.81.99-.99 1.2-.18.2-.36.23-.67.08-.31-.15-1.32-.49-2.51-1.55-.93-.83-1.56-1.85-1.74-2.16-.18-.31-.02-.48.13-.63.14-.14.31-.36.46-.54.15-.18.2-.31.3-.51.1-.2.05-.38-.03-.54-.08-.15-.7-1.68-.96-2.3-.25-.6-.5-.52-.69-.53z" />
            </svg>
        );
    }

    if (key === 'youtube') {
        return <Youtube className={className} />;
    }

    if (key === 'twitter' || key === 'x') {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className={className}
                aria-hidden="true"
            >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        );
    }

    if (key === 'facebook') {
        return <Facebook className={className} />;
    }

    if (key === 'linkedin') {
        return <Linkedin className={className} />;
    }

    if (key === 'telegram') {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className={className}
                aria-hidden="true"
            >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
        );
    }

    if (key === 'github') {
        return <Github className={className} />;
    }

    if (key === 'website') {
        return <Globe className={className} />;
    }

    return <LinkIcon className={className} />;
}
