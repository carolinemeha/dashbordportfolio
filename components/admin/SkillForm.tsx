'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skill } from '@/lib/data';
import { Wrench, Layers } from 'lucide-react';
import {
  SKILL_ICON_OPTIONS,
  SKILL_REACT_ICON_MAP,
  inferSkillIconKeyFromName,
} from '@/lib/skill-icons';
import { LocaleTextFieldGroup } from '@/components/admin/LocaleTextFieldGroup';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import { skillCategoryLabel } from '@/lib/admin-ui-labels';
import { emptyLocaleText } from '@/lib/locale-text';
import { BilingualFormHint } from '@/components/admin/BilingualFormHint';
import { pickLocalized } from '@/lib/locale-text';

interface SkillFormProps {
  skill?: Skill | null;
  onSave: (skill: Omit<Skill, 'id'>) => void;
  onCancel: () => void;
}

const SKILL_CATEGORIES: Skill['category'][] = [
  'Frontend',
  'Backend',
  'Mobile',
  'Design',
  'Commerce',
  'Autres',
];

function normalizeSkillCategory(c: string | undefined): Skill['category'] {
  return c && SKILL_CATEGORIES.includes(c as Skill['category'])
    ? (c as Skill['category'])
    : 'Frontend';
}

/** Même jeu d’icônes que le CV (react-icons). */
const DEFAULT_ICON = 'FaHtml5';

export default function SkillForm({ skill, onSave, onCancel }: SkillFormProps) {
  const { t } = useAdminI18n();
  const [formData, setFormData] = useState<Omit<Skill, 'id'>>({
    nameI18n: emptyLocaleText(),
    category: 'Frontend',
    level: 0,
    iconName: DEFAULT_ICON,
  });

  useEffect(() => {
    if (skill) {
      const icon = skill.iconName?.trim();
      const nameForIcon =
        pickLocalized(skill.nameI18n, 'fr') || pickLocalized(skill.nameI18n, 'en');
      const inferred = nameForIcon
        ? inferSkillIconKeyFromName(nameForIcon)
        : null;
      const validIcon =
        icon && icon in SKILL_REACT_ICON_MAP
          ? icon
          : inferred && inferred in SKILL_REACT_ICON_MAP
            ? inferred
            : DEFAULT_ICON;
      setFormData({
        nameI18n: skill.nameI18n ?? emptyLocaleText(),
        category: normalizeSkillCategory(skill.category),
        level: typeof skill.level === 'number' ? skill.level : 0,
        iconName: validIcon,
      });
    } else {
      setFormData({
        nameI18n: emptyLocaleText(),
        category: 'Frontend',
        level: 0,
        iconName: DEFAULT_ICON,
      });
    }
  }, [skill]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nameI18n: {
        fr: formData.nameI18n.fr.trim(),
        en: formData.nameI18n.en.trim(),
      },
      category: formData.category,
      level: 0,
      iconName: formData.iconName || DEFAULT_ICON,
    });
  };

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-xl glass-card border-border/50 text-foreground sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            {skill ? t('forms.skill.titleEdit') : t('forms.skill.titleNew')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {skill ? t('forms.skill.descEdit') : t('forms.skill.descNew')}
          </DialogDescription>
          <BilingualFormHint />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-6">
            <LocaleTextFieldGroup
              label={
                <>
                  {t('forms.skill.name')} <span className="text-destructive">*</span>
                </>
              }
              value={formData.nameI18n}
              onChange={(nameI18n) => setFormData({ ...formData, nameI18n })}
              requiredFr
              inputIdPrefix="skill-name"
              placeholderFr={t('forms.skill.namePh')}
              placeholderEn={t('forms.skill.namePhEn')}
            />

            <div className="space-y-3 p-4 bg-secondary/10 rounded-xl border border-border/30">
              <Label className="text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" /> {t('forms.skill.category')}
              </Label>
              <div className="flex flex-wrap gap-2">
                {SKILL_CATEGORIES.map((cat) => (
                  <Badge
                    key={cat}
                    variant={formData.category === cat ? 'default' : 'outline'}
                    className={`cursor-pointer px-3 py-1.5 transition-all text-sm font-normal ${
                      formData.category === cat
                        ? 'bg-primary text-primary-foreground border-transparent'
                        : 'bg-background hover:bg-secondary/80 border-border/60'
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, category: cat as Skill['category'] })
                    }
                  >
                    {skillCategoryLabel(cat, t)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <Label className="text-foreground">{t('forms.skill.iconPick')}</Label>
              <p className="text-xs text-muted-foreground -mt-1 mb-2">
                {t('forms.skill.iconHelp')}
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {SKILL_ICON_OPTIONS.map(({ key, label }) => {
                  const Icon = SKILL_REACT_ICON_MAP[key];
                  const selected = formData.iconName === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      title={label}
                      onClick={() => setFormData({ ...formData, iconName: key })}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 transition-all ${
                        selected
                          ? 'border-primary bg-primary/15 ring-2 ring-primary/30'
                          : 'border-border/50 bg-background/50 hover:border-primary/40 hover:bg-primary/5'
                      }`}
                    >
                      <Icon className="h-5 w-5 text-primary shrink-0" aria-hidden />
                      <span className="text-[9px] text-muted-foreground truncate w-full text-center leading-tight">
                        {key}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Niveau de maîtrise : conservé à 0 en base, plus saisi dans l’UI.
            <div className="space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
              ...
            </div>
            */}
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 sm:justify-end">
            <Button type="button" variant="ghost" onClick={onCancel}>
              {t('forms.shared.cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25"
            >
              {skill ? t('forms.shared.saveChanges') : t('forms.skill.addSkill')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
