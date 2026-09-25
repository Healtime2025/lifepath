import { neon } from '@neondatabase/serverless';

type LifePathRow = Record<string, any>;
type LifePathQueryResult = LifePathRow[];

let client: ReturnType<typeof neon> | null = null;

export function db() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error('DATABASE_URL is not configured');
  }

  if (!client) {
    client = neon(url);
  }

  return client as unknown as (
    strings: TemplateStringsArray,
    ...values: any[]
  ) => Promise<LifePathQueryResult>;
}
