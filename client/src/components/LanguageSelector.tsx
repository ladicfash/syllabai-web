import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/lib/trpc';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

const LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Español' },
  { code: 'de-DE', name: 'Deutsch' },
  { code: 'fr-FR', name: 'Français' },
  { code: 'zh-CN', name: '中文 (简体)' },
  { code: 'vi-VN', name: 'Tiếng Việt' },
  { code: 'pt-BR', name: 'Português' },
  { code: 'ur-PK', name: 'اردو' },
  { code: 'ar-SA', name: 'العربية' },
  { code: 'it-IT', name: 'Italiano' },
  { code: 'ja-JP', name: '日本語' },
  { code: 'yo-NG', name: 'Yorùbá' },
  { code: 'ko-KR', name: '한국어' },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [isLoading, setIsLoading] = useState(false);

  const updateLanguageMutation = trpc.auth.updateLanguage.useMutation({
    onSuccess: (data) => {
      i18n.changeLanguage(data.language);
      setSelectedLanguage(data.language);
      toast.success('Language preference updated.');
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update language preference.');
      setIsLoading(false);
    },
  });

  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    setIsLoading(true);
    updateLanguageMutation.mutate({ language: newLanguage });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="language-select">Language</Label>
      <div className="flex items-center gap-2">
        <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={isLoading}>
          <SelectTrigger id="language-select" className="w-full max-w-xs">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isLoading && <Spinner className="h-4 w-4" />}
      </div>
      <p className="text-xs text-muted-foreground">
        Your language preference will be saved to your profile and applied across the platform.
      </p>
    </div>
  );
}
