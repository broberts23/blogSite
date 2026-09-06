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
  status: 'active' | 'inactive';
  credentialUrl?: string;
}

export function loadCertifications(): Certification[] {
  const file = path.join(process.cwd(), 'src/data/certifications.yaml');
  const raw = fs.readFileSync(file, 'utf8');
  const data = yaml.load(raw);
  if (!Array.isArray(data)) return [];
  return data as Certification[];
}
