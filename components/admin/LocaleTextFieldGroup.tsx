'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { LocaleText } from '@/lib/locale-text';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';

type Props = {
  label: React.ReactNode;
  value: LocaleText;
  onChange: (v: LocaleText) => void;
  requiredFr?: boolean;
  multiline?: boolean;
  placeholderFr?: string;
  placeholderEn?: string;
  inputIdPrefix: string;
  className?: string;
};

export function LocaleTextFieldGroup({
  label,
  value,
  onChange,
  requiredFr,
  multiline,
  placeholderFr,
  placeholderEn,
  inputIdPrefix,
  className,
}: Props) {
  const { t } = useAdminI18n();
  const Field = multiline ? Textarea : Input;
  return (
    <div className={className ?? 'space-y-2'}>
      <Label className="text-foreground">{label}</Label>
      <Tabs defaultValue="fr" className="w-full">
        <TabsList className="grid w-full max-w-[220px] grid-cols-2">
          <TabsTrigger value="fr">{t('forms.shared.langFr')}</TabsTrigger>
          <TabsTrigger value="en">{t('forms.shared.langEn')}</TabsTrigger>
        </TabsList>
        <TabsContent value="fr" className="mt-3 space-y-2">
          <Field
            id={`${inputIdPrefix}-fr`}
            value={value.fr}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              onChange({ ...value, fr: e.target.value })
            }
            placeholder={placeholderFr}
            required={requiredFr}
            className={
              multiline
                ? 'min-h-[100px] bg-secondary/30 border-border/50 focus-visible:ring-primary/50'
                : 'bg-secondary/30 border-border/50 focus-visible:ring-primary/50'
            }
          />
        </TabsContent>
        <TabsContent value="en" className="mt-3 space-y-2">
          <Field
            id={`${inputIdPrefix}-en`}
            value={value.en}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              onChange({ ...value, en: e.target.value })
            }
            placeholder={placeholderEn}
            className={
              multiline
                ? 'min-h-[100px] bg-secondary/30 border-border/50 focus-visible:ring-primary/50'
                : 'bg-secondary/30 border-border/50 focus-visible:ring-primary/50'
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
