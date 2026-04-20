'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Certification } from '@/lib/data';
import { Award, Calendar, Building, LinkIcon } from 'lucide-react';
import { LocaleTextFieldGroup } from '@/components/admin/LocaleTextFieldGroup';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import { emptyLocaleText } from '@/lib/locale-text';
import { BilingualFormHint } from '@/components/admin/BilingualFormHint';

interface CertificationFormProps {
  certification: Certification | null;
  onSave: (certification: Omit<Certification, 'id'>) => void;
  onCancel: () => void;
}

export default function CertificationForm({ certification, onSave, onCancel }: CertificationFormProps) {
  const { t } = useAdminI18n();
  const empty = (): Omit<Certification, 'id'> => ({
    titleI18n: emptyLocaleText(),
    issuerI18n: emptyLocaleText(),
    date: '',
    credential: '',
  });

  const [formData, setFormData] = useState<Omit<Certification, 'id'>>(() =>
    certification
      ? {
          titleI18n: certification.titleI18n,
          issuerI18n: certification.issuerI18n,
          date: certification.date,
          credential: certification.credential ?? '',
        }
      : empty()
  );

  useEffect(() => {
    setFormData(
      certification
        ? {
            titleI18n: certification.titleI18n,
            issuerI18n: certification.issuerI18n,
            date: certification.date,
            credential: certification.credential ?? '',
          }
        : empty()
    );
  }, [certification]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-[500px] glass-card border-border/50 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            {certification ? t('forms.certification.titleEdit') : t('forms.certification.titleNew')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('forms.certification.description')}
          </DialogDescription>
          <BilingualFormHint />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <LocaleTextFieldGroup
            label={
              <>
                {t('forms.certification.certTitle')} <span className="text-destructive">*</span>
              </>
            }
            value={formData.titleI18n}
            onChange={(titleI18n) => setFormData({ ...formData, titleI18n })}
            requiredFr
            inputIdPrefix="cert-title"
            placeholderFr={t('forms.certification.certTitlePh')}
            placeholderEn={t('forms.certification.certTitlePhEn')}
          />

          <LocaleTextFieldGroup
            label={
              <>
                <Building className="h-4 w-4 text-muted-foreground inline mr-1" />
                {t('forms.certification.issuer')} <span className="text-destructive">*</span>
              </>
            }
            value={formData.issuerI18n}
            onChange={(issuerI18n) => setFormData({ ...formData, issuerI18n })}
            requiredFr
            inputIdPrefix="cert-issuer"
            placeholderFr={t('forms.certification.issuerPh')}
            placeholderEn={t('forms.certification.issuerPhEn')}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" /> {t('forms.certification.date')}{' '}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder={t('forms.certification.datePh')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credential" className="text-foreground flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" /> {t('forms.certification.credential')}
              </Label>
              <Input
                id="credential"
                value={formData.credential || ''}
                onChange={(e) => setFormData({ ...formData, credential: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder={t('forms.certification.credentialPh')}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40">
            <Button type="button" variant="ghost" onClick={onCancel}>
              {t('forms.shared.cancel')}
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25">
              {certification ? t('forms.shared.update') : t('forms.shared.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
