import { Form, Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import type { Auth } from '@/types';
import { send } from '@/routes/verification';
import { Camera, ExternalLink, Trash2, Upload } from 'lucide-react';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(auth.user.avatar || null);
    const [removeAvatar, setRemoveAvatar] = useState(false);

    useEffect(() => {
        setAvatarPreview(auth.user.avatar || null);
        setRemoveAvatar(false);
    }, [auth.user.avatar]);

    const initials = (auth.user.name || '')
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
            setRemoveAvatar(false);
        }
    };

    const handleRemoveAvatar = () => {
        setRemoveAvatar(true);
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Update your information profile, username, about description, and profile photo"
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* ───── FOTO PROFIL (AVATAR) ───── */}
                            <div className="grid gap-3">
                                <Label>Profile Image</Label>

                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <div className="relative size-20 shrink-0 overflow-hidden rounded-full border-2 border-foreground bg-primary/10 shadow-xs">
                                        <Avatar className="size-full">
                                            <AvatarImage
                                                src={avatarPreview || undefined}
                                                alt={auth.user.name}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="font-mono text-xl font-black text-foreground">
                                                {initials || <Camera className="size-6 text-muted-foreground" />}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                id="avatar"
                                                name="avatar"
                                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                            <input
                                                type="hidden"
                                                name="remove_avatar"
                                                value={removeAvatar ? '1' : '0'}
                                            />

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="gap-2"
                                            >
                                                <Upload className="size-4" />
                                                {avatarPreview ? 'Update Profile' : 'Upload Profile'}
                                            </Button>

                                            {avatarPreview && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleRemoveAvatar}
                                                    className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="size-4" />
                                                    Delete Image
                                                </Button>
                                            )}
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            Format: JPG, PNG, atau WEBP. Max 2MB.
                                        </p>
                                    </div>
                                </div>

                                <InputError
                                    className="mt-1"
                                    message={errors.avatar}
                                />
                            </div>

                            {/* ───── NAME ───── */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            {/* ───── USERNAME ───── */}
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="username">Username</Label>
                                    {auth.user.username && (
                                        <Link
                                            href={`/${auth.user.username}`}
                                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                            target="_blank"
                                        >
                                            <span>Review Your Public Profile</span>
                                            <ExternalLink className="size-3" />
                                        </Link>
                                    )}
                                </div>

                                <div className="relative mt-1">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 font-mono text-sm text-muted-foreground">
                                        @
                                    </span>
                                    <Input
                                        id="username"
                                        className="block w-full pl-8 font-mono text-sm"
                                        defaultValue={auth.user.username}
                                        name="username"
                                        required
                                        autoComplete="username"
                                        placeholder="username_anda"
                                    />
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    Unique Username that used for your public profile URL (eventoria.id/{auth.user.username || 'username'}).
                                </p>

                                <InputError
                                    className="mt-2"
                                    message={errors.username}
                                />
                            </div>

                            {/* ───── ABOUT / BIO ───── */}
                            <div className="grid gap-2">
                                <Label htmlFor="about">About / Description</Label>

                                <textarea
                                    id="about"
                                    name="about"
                                    rows={4}
                                    defaultValue={auth.user.about ?? ''}
                                    placeholder="Tell us about your company..."
                                    className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive mt-1 flex min-h-[100px] w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                />

                                <p className="text-xs text-muted-foreground">
                                    This decription will be shown on your public vendor profile page.
                                </p>

                                <InputError
                                    className="mt-2"
                                    message={errors.about}
                                />
                            </div>

                            {/* ───── EMAIL ───── */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Click here to re-send the
                                                verification email.
                                            </Link>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has been
                                                sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    {processing ? 'Menyimpan...' : 'Save Changes'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
