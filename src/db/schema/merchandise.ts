import { pgTable, timestamp, integer, uuid, varchar } from 'drizzle-orm/pg-core';

export const merchandiseInventory = pgTable('merchandise_inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  size: varchar('size', { length: 10 }).notNull().unique(), // e.g., 'S', 'M', 'L', 'XL', 'XXL'
  stock: integer('stock').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
