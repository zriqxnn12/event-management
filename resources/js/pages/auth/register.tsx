import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Buat Akun Baru" />

            {/* Top Ornament Badge */}
            <div className="mb-4 flex items-center justify-center">
                <Badge
                    variant="secondary"
                    className="border-2 border-foreground px-3 py-1 text-xs font-bold shadow-2xs gap-1.5"
                >
                    <Sparkles className="size-3.5 text-foreground" />
                    Akses Penuh ke eventoria.id
                </Badge>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-3.5">
                            <div className="grid gap-1.5">
                                <Label htmlFor="name" className="font-bold text-foreground">
                                    Nama Lengkap
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Nama Lengkap Anda"
                                    className="border-2 border-foreground font-medium shadow-xs focus-visible:ring-2 focus-visible:ring-primary h-10"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-1"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="email" className="font-bold text-foreground">
                                    Alamat Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="nama@email.com"
                                    className="border-2 border-foreground font-medium shadow-xs focus-visible:ring-2 focus-visible:ring-primary h-10"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="username" className="font-bold text-foreground">
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    required
                                    tabIndex={3}
                                    autoComplete="username"
                                    name="username"
                                    placeholder="username_kamu"
                                    className="border-2 border-foreground font-medium shadow-xs focus-visible:ring-2 focus-visible:ring-primary h-10"
                                />
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password" className="font-bold text-foreground">
                                    Kata Sandi
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Minimal 8 karakter"
                                    passwordrules={passwordRules}
                                    className="border-2 border-foreground font-medium shadow-xs focus-visible:ring-2 focus-visible:ring-primary h-10"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password_confirmation" className="font-bold text-foreground">
                                    Konfirmasi Kata Sandi
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Ulangi kata sandi"
                                    passwordrules={passwordRules}
                                    className="border-2 border-foreground font-medium shadow-xs focus-visible:ring-2 focus-visible:ring-primary h-10"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            {/* Neo-brutalist Benefits Box Ornament */}
                            <div className="border-2 border-foreground bg-secondary/30 p-3 shadow-2xs text-xs">
                                <div className="font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                                    <CheckCircle2 className="size-3.5 text-primary" />
                                    <span>Keuntungan Bergabung di eventoria.id:</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1 font-semibold text-muted-foreground text-[11px]">
                                    <div>✓ Gratis selamanya</div>
                                    <div>✓ Tiket & QR instan</div>
                                    <div>✓ Bikin event 5 menit</div>
                                    <div>✓ Laporan real-time</div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="mt-1 w-full border-2 border-foreground bg-primary text-primary-foreground font-black text-base shadow-sm hover:shadow-md active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer h-11"
                                tabIndex={6}
                                disabled={processing}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                <span>Daftar Akun Sekarang</span>
                                <ArrowRight data-icon="inline-end" />
                            </Button>
                        </div>

                        {/* Divider */}
                        <div className="relative my-1">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-foreground/15" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 font-mono font-bold text-muted-foreground">
                                    Sudah Punya Akun?
                                </span>
                            </div>
                        </div>

                        {/* Login CTA */}
                        <Link
                            href={login()}
                            tabIndex={7}
                            className="flex items-center justify-center gap-2 border-2 border-foreground bg-secondary/40 py-2.5 px-4 font-bold text-sm shadow-xs transition-all hover:bg-secondary hover:-translate-y-0.5 hover:shadow-sm"
                        >
                            <span>Masuk ke Akun Anda</span>
                            <ArrowRight className="size-4" />
                        </Link>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Buat Akun Baru',
    description: 'Daftar sekarang dan kelola event impian Anda di eventoria.id',
};
