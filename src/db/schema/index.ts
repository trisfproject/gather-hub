import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Dummy table for testing migration
export const systemConfig = pgTable('system_config', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
