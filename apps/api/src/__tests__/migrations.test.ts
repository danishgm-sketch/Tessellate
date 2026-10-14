import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { getTableConfig } from 'drizzle-orm/sqlite-core';
import { is } from 'drizzle-orm';
import { SQLiteTable } from 'drizzle-orm/sqlite-core';
import * as schema from '../db/schema.js';

const MIGRATIONS_DIR = path.resolve(__dirname, '../../migrations');

function migratedDatabase(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) db.exec(fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8'));
  return db;
}

describe('D1 migrations (Phase 26 gate)', () => {
  it('apply cleanly, in order, to an empty database', () => {
    expect(() => migratedDatabase()).not.toThrow();
  });

  it('create every table and column the Drizzle schema expects', () => {
    const db = migratedDatabase();
    const missing: string[] = [];
    for (const value of Object.values(schema)) {
      if (!is(value, SQLiteTable)) continue;
      const config = getTableConfig(value);
      const columns = new Set(
        (db.prepare(`PRAGMA table_info(${config.name})`).all() as Array<{ name: string }>).map((c) => c.name),
      );
      if (columns.size === 0) {
        missing.push(`table ${config.name}`);
        continue;
      }
      for (const col of config.columns) {
        if (!columns.has(col.name)) missing.push(`${config.name}.${col.name}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
