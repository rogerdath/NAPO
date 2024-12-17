import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTheme } from 'next-themes';
import { t } from '@/app/lib/i18n';
import { useLanguage } from '@/components/theme/language-provider';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'no', name: 'Norsk' },
] as const;

const themes = [
    { value: 'light', label: 'common.light' },
    { value: 'dark', label: 'common.dark' },
    { value: 'system', label: 'common.system' },
] as const;

export function SettingsDialog() {
    const { language, setLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Settings className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('common.settings', language)}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            {t('common.language', language)}
                        </label>
                        <Select 
                            value={language} 
                            onValueChange={(value) => setLanguage(value as 'en' | 'no')}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map((lang) => (
                                    <SelectItem key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            {t('common.theme', language)}
                        </label>
                        <Select 
                            value={theme} 
                            onValueChange={setTheme}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {themes.map((themeOption) => (
                                    <SelectItem key={themeOption.value} value={themeOption.value}>
                                        {t(themeOption.label, language)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 