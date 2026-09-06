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
