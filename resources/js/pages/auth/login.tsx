import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import PasskeyVerify from '@/components/passkey-verify';
import { ArrowRight, Sparkles, Zap, ShieldCheck } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Masuk ke Akun" />

            <PasskeyVerify />

            {/* Top Ornament Badge */}
            <div className="mb-4 flex items-center justify-center">
                <Badge
                    variant="secondary"
                    className="border-2 border-foreground px-3 py-1 text-xs font-bold shadow-2xs gap-1.5"
                >
                    <Zap className="size-3.5 text-foreground" />
                    Organizer & Peserta Event
                </Badge>
            </div>

            {status && (
                <div className="mb-6 border-2 border-foreground bg-secondary/80 p-3 text-center text-sm font-bold shadow-xs">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="email" className="font-bold text-foreground">
                                    Alamat Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    className="border-2 border-foreground font-medium shadow-xs focus-visible:ring-2 focus-visible:ring-primary h-10"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="font-bold text-foreground">
                                        Kata Sandi
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs font-bold text-primary underline underline-offset-4 hover:text-primary/80"
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="border-2 border-foreground font-medium shadow-xs focus-visible:ring-2 focus-visible:ring-primary h-10"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-2.5 pt-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-2 border-foreground shadow-2xs data-[state=checked]:bg-primary"
                                />
                                <Label htmlFor="remember" className="text-xs font-semibold cursor-pointer">
                                    Ingat saya di perangkat ini
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full border-2 border-foreground bg-primary text-primary-foreground font-black text-base shadow-sm hover:shadow-md active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer h-11"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                <span>Masuk Sekarang</span>
                                <ArrowRight data-icon="inline-end" />
                            </Button>
                        </div>

                        {/* Divider */}
                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-foreground/15" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 font-mono font-bold text-muted-foreground">
                                    Belum Punya Akun?
                                </span>
                            </div>
                        </div>

                        {/* Sign Up CTA */}
                        <Link
                            href={register()}
                            tabIndex={6}
                            className="flex items-center justify-center gap-2 border-2 border-foreground bg-secondary/40 py-2.5 px-4 font-bold text-sm shadow-xs transition-all hover:bg-secondary hover:-translate-y-0.5 hover:shadow-sm"
                        >
                            <span>Daftar Akun Baru</span>
                            <Sparkles className="size-4" />
                        </Link>

                        {/* Security notice */}
                        <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                            <ShieldCheck className="size-3.5 text-primary" />
                            <span>Koneksi aman terenkripsi 256-bit</span>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Masuk ke Akun',
    description: 'Masukkan email dan kata sandi Anda untuk mengakses dashboard',
};
