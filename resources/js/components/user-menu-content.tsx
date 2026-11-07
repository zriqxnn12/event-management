import { Link, router } from '@inertiajs/react';
import { Check, LogOut, Monitor, Moon, Settings, Sun } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useAppearance } from '@/hooks/use-appearance';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const { appearance, updateAppearance } = useAppearance();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="flex w-full cursor-pointer items-center"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2 size-4" />
                        Settings
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer">
                        {appearance === 'dark' ? (
                            <Moon className="mr-2 size-4 text-primary" />
                        ) : appearance === 'light' ? (
                            <Sun className="mr-2 size-4 text-amber-500" />
                        ) : (
                            <Monitor className="mr-2 size-4 text-muted-foreground" />
                        )}
                        <span>Tema: {appearance === 'dark' ? 'Dark' : appearance === 'light' ? 'Light' : 'Sistem'}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-36">
                        <DropdownMenuItem
                            className="flex cursor-pointer items-center"
                            onClick={() => updateAppearance('light')}
                        >
                            <Sun className="mr-2 size-4 text-amber-500" />
                            <span>Light</span>
                            {appearance === 'light' && <Check className="ml-auto size-4" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex cursor-pointer items-center"
                            onClick={() => updateAppearance('dark')}
                        >
                            <Moon className="mr-2 size-4 text-primary" />
                            <span>Dark</span>
                            {appearance === 'dark' && <Check className="ml-auto size-4" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex cursor-pointer items-center"
                            onClick={() => updateAppearance('system')}
                        >
                            <Monitor className="mr-2 size-4 text-muted-foreground" />
                            <span>Sistem</span>
                            {appearance === 'system' && <Check className="ml-auto size-4" />}
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="flex w-full cursor-pointer items-center text-destructive focus:text-destructive"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2 size-4" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
