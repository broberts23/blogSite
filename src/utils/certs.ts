import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export interface Certification {
  name: string;
  code?: string;
  badgeUrl?: string;
  issuer: string;
  earned: string;
  expires?: string | null;
  expired?: string | null;
  status: 'active' | 'inactive';
  credentialUrl?: string;
}

const ALLOWED_CERT_HOSTS = new Set([
  'learn.microsoft.com',
  'www.credly.com',
  'images.credly.com',
  'credly.com',
]);

export function sanitizeCertUrl(urlStr?: string | null): string | undefined {
  if (!urlStr || typeof urlStr !== 'string') return undefined;
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:') return undefined;
    if (!ALLOWED_CERT_HOSTS.has(parsed.hostname.toLowerCase())) return undefined;
    return parsed.href;
  } catch {
    return undefined;
  }
}

export function isExpertCertification(cert: Certification): boolean {
  if (/\bExpert\b/i.test(cert.name)) return true;
  return Boolean(cert.badgeUrl?.includes('microsoft-certified-expert-badge'));
}

function earnedTime(cert: Certification): number {
  return new Date(cert.earned).valueOf();
}

export function compareByEarnedDesc(a: Certification, b: Certification): number {
  return earnedTime(b) - earnedTime(a) || a.name.localeCompare(b.name);
}

export function compareForDisplay(a: Certification, b: Certification): number {
  if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
  return compareByEarnedDesc(a, b);
}

export function loadCertifications(): Certification[] {
  const file = path.join(process.cwd(), 'src/data/certifications.yaml');
  const raw = fs.readFileSync(file, 'utf8');
  const data = yaml.load(raw);
  if (!Array.isArray(data)) return [];
  return (data as Certification[]).map((cert) => ({
    ...cert,
    badgeUrl: sanitizeCertUrl(cert.badgeUrl),
    credentialUrl: sanitizeCertUrl(cert.credentialUrl),
  }));
}
