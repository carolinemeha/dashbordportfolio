/**
 * Met à jour dans Supabase les champs EN des colonnes JSONB `{ fr, en }` à partir du français.
 *
 * Portée : **about**, **projects**, **experiences**, **education**, **skills**, **services**, **certifications**
 * (même conventions que le formulaire admin : JSONB i18n + colonnes legacy = copie FR).
 *
 * Installation : `npm i` depuis `adminPortfolio/` (tsx en devDependency).
 *
 * Usage :
 *   npm run translate:en
 *   npm run translate:en -- --dry-run
 *   npm run translate:en -- --force
 *
 * Clés `.env.local` :
 * - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (obligatoires)
 * - **Ou DeepL** (prioritaire si défini) : `DEEPL_AUTH_KEY`
 * - **Ou Groq** (rapide / compatible OpenAI) : `GROQ_API_KEY`, optionnel `GROQ_TRANSLATE_MODEL` (défaut `llama-3.3-70b-versatile`)
 * - **Ou OpenAI** : `OPENAI_API_KEY`, optionnel `OPENAI_TRANSLATE_MODEL` (défaut `gpt-4o-mini`)
 *
 * Priorité des backends : DeepL si défini, sinon Groq si `GROQ_API_KEY`, sinon OpenAI.
 */

/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import type { LocaleText } from '../lib/locale-text';
import {
  aboutInfoToDbPayload,
  certificationToDbPayload,
  educationToDbPayload,
  experienceToDbPayload,
  mapAboutRowToInfo,
  mapCertificationRow,
  mapEducationRow,
  mapExperienceRow,
  mapProjectRow,
  mapServiceRow,
  mapSkillFromRow,
  projectUpdatePayload,
  skillToDbPayload,
  serviceToDbPayload,
} from '../lib/data';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Aligné sur l’usage Next : `.env` puis `.env.local` avec priorité locale.
 * Réécrit systématiquement les paires définies dans le fichier pour éviter
 * qu’un `GROQ_API_KEY=` vide dans l’environnement système bloque `.env.local`.
 */
function parseEnvFile(filePath: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return out;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

function loadEnvFiles(): void {
  const root = path.join(__dirname, '..');
  const base = parseEnvFile(path.join(root, '.env'));
  const local = parseEnvFile(path.join(root, '.env.local'));
  for (const [k, v] of Object.entries(base)) process.env[k] = v;
  for (const [k, v] of Object.entries(local)) process.env[k] = v;
}

function shouldTranslateField(lt: LocaleText, force: boolean): boolean {
  const fr = (lt.fr ?? '').trim();
  if (!fr) return false;
  if (force) return true;
  return !(lt.en ?? '').trim();
}

function mergeLocaleTexts(lt: LocaleText, translatedEn: string): LocaleText {
  return {
    fr: lt.fr ?? '',
    en: (translatedEn ?? '').trim(),
  };
}

function fillLtOrNull(
  lt: LocaleText,
  dict: Map<string, string>,
  force: boolean
): LocaleText | null {
  if (!shouldTranslateField(lt, force)) return null;
  const fr = (lt.fr ?? '').trim();
  const enOut = dict.get(fr)?.trim() ?? '';
  if (!enOut) return null;
  return mergeLocaleTexts(lt, enOut);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

type ChatCompletionTranslatorOptions = {
  completionUrl: string;
  apiKey: string;
  model: string;
  providerLabel: string;
};

async function translateWithOpenAiCompatibleBatch(
  uniqTexts: string[],
  {
    completionUrl,
    apiKey,
    model,
    providerLabel,
  }: ChatCompletionTranslatorOptions
): Promise<string[]> {
  const res = await fetch(completionUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You translate short UI copy from French to English for a developer portfolio.
Keep unchanged where appropriate: URLs, emails, hashtags, fenced code/markdown tokens, lone brand names unchanged in English (React, Tailwind…).
Respond with ONLY valid JSON: {"items":["...", ...]} — exactly the same length and order as the user's strings array.`,
        },
        {
          role: 'user',
          content: JSON.stringify({
            strings: uniqTexts,
            instruction:
              'Translate each strings[i] French → English. JSON output only.',
          }),
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(
      `${providerLabel} HTTP ${res.status}: ${errText.slice(0, 500)}`
    );
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw =
    typeof data?.choices?.[0]?.message?.content === 'string'
      ? data.choices[0].message.content
      : '{}';
  const parsed = JSON.parse(raw) as { items?: string[] };
  const items = parsed.items;
  if (!Array.isArray(items) || items.length !== uniqTexts.length) {
    throw new Error(
      `Réponse ${providerLabel} invalide (${items?.length ?? 0}/${uniqTexts.length} items)`
    );
  }
  return items.map((x) => (typeof x === 'string' ? x : ''));
}

async function translateWithGroqBatch(uniqTexts: string[]): Promise<string[]> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) throw new Error('GROQ_API_KEY manquant');
  const model =
    process.env.GROQ_TRANSLATE_MODEL?.trim() || 'llama-3.3-70b-versatile';

  return translateWithOpenAiCompatibleBatch(uniqTexts, {
    completionUrl: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey,
    model,
    providerLabel: 'Groq',
  });
}

async function translateWithOpenAIBatch(uniqTexts: string[]): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('OPENAI_API_KEY manquant');
  const model =
    process.env.OPENAI_TRANSLATE_MODEL?.trim() || 'gpt-4o-mini';

  return translateWithOpenAiCompatibleBatch(uniqTexts, {
    completionUrl: 'https://api.openai.com/v1/chat/completions',
    apiKey,
    model,
    providerLabel: 'OpenAI',
  });
}

async function translateWithDeepLBatch(uniqTexts: string[]): Promise<string[]> {
  const key = (
    process.env.DEEPL_AUTH_KEY ?? process.env.DEEPL_API_KEY
  )?.trim();
  if (!key) throw new Error('DEEPL_AUTH_KEY manquant');

  const isFree = key.endsWith(':fx');
  const host = isFree ? 'https://api-free.deepl.com' : 'https://api.deepl.com';

  const body = new URLSearchParams();
  body.set('auth_key', key);
  body.set('source_lang', 'FR');
  body.set('target_lang', 'EN');
  for (const text of uniqTexts) {
    body.append('text', text);
  }

  const res = await fetch(`${host}/v2/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`DeepL HTTP ${res.status}: ${errText.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    translations?: Array<{ text: string }>;
  };
  const tr = data.translations;
  if (!Array.isArray(tr) || tr.length !== uniqTexts.length) {
    throw new Error('Réponse DeepL invalide');
  }
  return tr.map((x) => x.text ?? '');
}

async function buildTranslationDict(frStrings: Set<string>): Promise<Map<string, string>> {
  const uniq = Array.from(frStrings)
    .map((s) => s.trim())
    .filter(Boolean);
  const dict = new Map<string, string>();
  if (uniq.length === 0) return dict;

  const deepL =
    !!(process.env.DEEPL_AUTH_KEY ?? process.env.DEEPL_API_KEY)?.trim();
  const groq = !!process.env.GROQ_API_KEY?.trim();

  const CHUNK = deepL ? 40 : groq ? 20 : 16;
  const llmSleep = groq ? 80 : 350;

  for (let i = 0; i < uniq.length; i += CHUNK) {
    const slice = uniq.slice(i, i + CHUNK);
    try {
      const out = deepL
        ? await translateWithDeepLBatch(slice)
        : groq
          ? await translateWithGroqBatch(slice)
          : await translateWithOpenAIBatch(slice);
      slice.forEach((s, idx) => dict.set(s, (out[idx] ?? '').trim()));
    } catch (e) {
      console.error(`Échec lot ${i}-${i + slice.length}:`, e);
    }
    if (i + CHUNK < uniq.length) await sleep(deepL ? 120 : llmSleep);
  }
  return dict;
}

function pushNeed(lt: LocaleText, force: boolean, bucket: Set<string>): void {
  const fr = (lt.fr ?? '').trim();
  if (!shouldTranslateField(lt, force)) return;
  bucket.add(fr);
}

function pushNeedArr(
  arr: LocaleText[],
  force: boolean,
  bucket: Set<string>
): void {
  for (const lt of arr) pushNeed(lt, force, bucket);
}

async function main() {
  const dryRun =
    process.argv.includes('--dry-run') ||
    process.env.TRANSLATE_DRY_RUN === '1';
  const force =
    process.argv.includes('--force') ||
    process.env.TRANSLATE_FORCE === '1';

  loadEnvFiles();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const hasDeepL =
    !!(process.env.DEEPL_AUTH_KEY ?? process.env.DEEPL_API_KEY)?.trim();
  const hasGroq = !!process.env.GROQ_API_KEY?.trim();
  const hasOpenAI = !!process.env.OPENAI_API_KEY?.trim();

  if (!url || !key) {
    console.error(
      'Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY'
    );
    process.exit(1);
  }
  if (!hasDeepL && !hasGroq && !hasOpenAI) {
    console.error(
      'Définissez GROQ_API_KEY, OPENAI_API_KEY ou DEEPL_AUTH_KEY pour la traduction.'
    );
    process.exit(1);
  }

  console.log(
    `Mode DeepL=${hasDeepL} Groq=${hasGroq} OpenAI=${hasOpenAI} dryRun=${dryRun} force=${force}`
  );

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  /** 1 — Collecte des fragments FR à traduire */
  const need = new Set<string>();

  const { data: aboutRow } = await supabase.from('about').select('*').limit(1).maybeSingle();
  if (aboutRow) {
    const a = mapAboutRowToInfo(aboutRow as Record<string, unknown>);
    pushNeed(a.nameI18n, force, need);
    pushNeed(a.titleI18n, force, need);
    pushNeed(a.bioI18n, force, need);
    pushNeed(a.locationI18n, force, need);
    pushNeed(a.timezoneI18n, force, need);
    pushNeed(a.availableStatusI18n, force, need);
    pushNeed(a.experienceI18n, force, need);
    pushNeed(a.nationalityI18n, force, need);
    pushNeed(a.freelanceStatusI18n, force, need);
    pushNeed(a.languagesI18n, force, need);
    pushNeed(a.heroBadgeI18n, force, need);
    pushNeed(a.homeAvailableTitleI18n, force, need);
    pushNeed(a.homeAvailableSubtitleI18n, force, need);
    pushNeedArr(a.rolesI18n, force, need);
  }

  const { data: projects } = await supabase.from('projects').select('*');
  for (const row of projects ?? []) {
    const p = mapProjectRow(row as Record<string, unknown>);
    pushNeed(p.titleI18n, force, need);
    pushNeed(p.descriptionI18n, force, need);
  }

  const { data: experiences } = await supabase.from('experiences').select('*');
  for (const row of experiences ?? []) {
    const e = mapExperienceRow(row as Record<string, unknown>);
    pushNeed(e.companyI18n, force, need);
    pushNeed(e.positionI18n, force, need);
    pushNeed(e.durationI18n, force, need);
    pushNeed(e.locationI18n, force, need);
    pushNeedArr(e.achievementsI18n, force, need);
  }

  const { data: education } = await supabase.from('education').select('*');
  for (const row of education ?? []) {
    const edu = mapEducationRow(row as Record<string, unknown>);
    pushNeed(edu.institutionI18n, force, need);
    pushNeed(edu.degreeI18n, force, need);
    pushNeed(edu.durationI18n, force, need);
    pushNeedArr(edu.coursesI18n, force, need);
  }

  const { data: skills } = await supabase.from('skills').select('*');
  for (const row of skills ?? []) {
    pushNeed(mapSkillFromRow(row as Record<string, unknown>).nameI18n, force, need);
  }

  const { data: services } = await supabase.from('services').select('*');
  for (const row of services ?? []) {
    const s = mapServiceRow(row as Record<string, unknown>);
    pushNeed(s.titleI18n, force, need);
    pushNeed(s.descriptionI18n, force, need);
    pushNeedArr(s.featuresI18n, force, need);
  }

  const { data: certs } = await supabase.from('certifications').select('*');
  for (const row of certs ?? []) {
    const c = mapCertificationRow(row as Record<string, unknown>);
    pushNeed(c.titleI18n, force, need);
    pushNeed(c.issuerI18n, force, need);
  }

  console.log(`Chaînes FR uniques à traduire ~ ${need.size}`);

  /** 2 — Dictionnaire traduction */
  const dict = await buildTranslationDict(need);
  console.log(`Entrées traduites en mémoire : ${dict.size}`);

  /** 3 — Écritures */
  if (aboutRow) {
    const info = mapAboutRowToInfo(aboutRow as Record<string, unknown>);
    const patches: Parameters<typeof aboutInfoToDbPayload>[0] = {};

    (
      [
        'nameI18n',
        'titleI18n',
        'bioI18n',
        'locationI18n',
        'timezoneI18n',
        'availableStatusI18n',
        'experienceI18n',
        'nationalityI18n',
        'freelanceStatusI18n',
        'languagesI18n',
        'heroBadgeI18n',
        'homeAvailableTitleI18n',
        'homeAvailableSubtitleI18n',
      ] satisfies (keyof typeof info)[]
    ).forEach((k) =>
      patchSingle(
        String(k),
        info[k as keyof typeof info] as LocaleText,
        patches as Record<string, LocaleText>,
        dict,
        force
      )
    );

    const nextRoles = info.rolesI18n.map((lt) => fillLtOrNull(lt, dict, force) ?? lt);
    if (JSON.stringify(nextRoles) !== JSON.stringify(info.rolesI18n)) {
      patches.rolesI18n = nextRoles;
    }

    const payloadAbout = aboutInfoToDbPayload(patches);
    if (Object.keys(payloadAbout).length > 0) {
      if (dryRun)
        console.log('about:', JSON.stringify(payloadAbout, null, 2));
      else {
        const { error } = await supabase
          .from('about')
          .update(payloadAbout)
          .eq('id', String((aboutRow as { id?: string }).id));
        console.log(error ? `about erreur ${error.message}` : 'about OK');
      }
    } else console.log('about : aucune modif');
  }

  for (const row of projects ?? []) {
    const id = String((row as { id?: string }).id ?? '');
    const p = mapProjectRow(row as Record<string, unknown>);
    const pu: Partial<typeof p> = {};
    const t1 = fillLtOrNull(p.titleI18n, dict, force);
    const t2 = fillLtOrNull(p.descriptionI18n, dict, force);
    if (t1) pu.titleI18n = t1;
    if (t2) pu.descriptionI18n = t2;
    const payload = projectUpdatePayload(pu);
    if (Object.keys(payload).length === 0) continue;
    if (dryRun) console.log(`project ${id}:`, payload);
    else {
      const { error } = await supabase.from('projects').update(payload).eq('id', id);
      console.log(error ? `project ${id}: ${error.message}` : `project ${id}: OK`);
    }
  }

  for (const row of experiences ?? []) {
    const id = String((row as { id?: string }).id ?? '');
    const e = mapExperienceRow(row as Record<string, unknown>);
    const eu: Partial<typeof e> = {};
    (
      ['companyI18n', 'positionI18n', 'durationI18n', 'locationI18n'] as const
    ).forEach((k) => {
      const nx = fillLtOrNull(e[k], dict, force);
      if (nx) eu[k] = nx;
    });
    const ach = e.achievementsI18n.map((lt) => fillLtOrNull(lt, dict, force) ?? lt);
    if (JSON.stringify(ach) !== JSON.stringify(e.achievementsI18n)) {
      eu.achievementsI18n = ach;
    }
    const payload = experienceToDbPayload(eu);
    if (Object.keys(payload).length === 0) continue;
    if (dryRun) console.log(`experience ${id}:`, payload);
    else {
      const { error } = await supabase.from('experiences').update(payload).eq('id', id);
      console.log(error ? `experience ${id}: ${error.message}` : `experience ${id}: OK`);
    }
  }

  for (const row of education ?? []) {
    const id = String((row as { id?: string }).id ?? '');
    const edu = mapEducationRow(row as Record<string, unknown>);
    const eu: Partial<typeof edu> = {};
    (
      ['institutionI18n', 'degreeI18n', 'durationI18n'] as const
    ).forEach((k) => {
      const nx = fillLtOrNull(edu[k], dict, force);
      if (nx) eu[k] = nx;
    });
    const cr = edu.coursesI18n.map((lt) => fillLtOrNull(lt, dict, force) ?? lt);
    if (JSON.stringify(cr) !== JSON.stringify(edu.coursesI18n)) {
      eu.coursesI18n = cr;
    }
    const payload = educationToDbPayload(eu);
    if (Object.keys(payload).length === 0) continue;
    if (dryRun) console.log(`education ${id}:`, payload);
    else {
      const { error } = await supabase.from('education').update(payload).eq('id', id);
      console.log(error ? `education ${id}: ${error.message}` : `education ${id}: OK`);
    }
  }

  for (const row of skills ?? []) {
    const id = String((row as { id?: string }).id ?? '');
    const sk = mapSkillFromRow(row as Record<string, unknown>);
    const nx = fillLtOrNull(sk.nameI18n, dict, force);
    if (!nx) continue;
    const payload = skillToDbPayload({ nameI18n: nx });
    if (dryRun) console.log(`skill ${id}:`, payload);
    else {
      const { error } = await supabase.from('skills').update(payload).eq('id', id);
      console.log(error ? `skill ${id}: ${error.message}` : `skill ${id}: OK`);
    }
  }

  for (const row of services ?? []) {
    const id = String((row as { id?: string }).id ?? '');
    const s = mapServiceRow(row as Record<string, unknown>);
    const su: Partial<typeof s> = {};
    const nt = fillLtOrNull(s.titleI18n, dict, force);
    const nd = fillLtOrNull(s.descriptionI18n, dict, force);
    if (nt) su.titleI18n = nt;
    if (nd) su.descriptionI18n = nd;
    const feat = s.featuresI18n.map((lt) => fillLtOrNull(lt, dict, force) ?? lt);
    if (JSON.stringify(feat) !== JSON.stringify(s.featuresI18n)) {
      su.featuresI18n = feat;
    }
    const payload = serviceToDbPayload(su);
    if (Object.keys(payload).length === 0) continue;
    if (dryRun) console.log(`service ${id}:`, payload);
    else {
      const { error } = await supabase.from('services').update(payload).eq('id', id);
      console.log(error ? `service ${id}: ${error.message}` : `service ${id}: OK`);
    }
  }

  for (const row of certs ?? []) {
    const id = String((row as { id?: string }).id ?? '');
    const c = mapCertificationRow(row as Record<string, unknown>);
    const cu: Partial<typeof c> = {};
    const t = fillLtOrNull(c.titleI18n, dict, force);
    const iss = fillLtOrNull(c.issuerI18n, dict, force);
    if (t) cu.titleI18n = t;
    if (iss) cu.issuerI18n = iss;
    const payload = certificationToDbPayload(cu);
    if (Object.keys(payload).length === 0) continue;
    if (dryRun) console.log(`certification ${id}:`, payload);
    else {
      const { error } = await supabase
        .from('certifications')
        .update(payload)
        .eq('id', id);
      console.log(
        error ? `certification ${id}: ${error.message}` : `certification ${id}: OK`
      );
    }
  }

  console.log('Terminé.');
}

function patchSingle(
  key: string,
  lt: LocaleText,
  patches: Record<string, LocaleText>,
  dict: Map<string, string>,
  force: boolean
): void {
  const nx = fillLtOrNull(lt, dict, force);
  if (nx) patches[key] = nx;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
