import { pgTable, timestamp, varchar, uuid } from 'drizzle-orm/pg-core';
import { participants } from './participants';

export const registrations = pgTable('registrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  registrationId: varchar('registration_id', { length: 50 }).notNull().unique(), // e.g. GATH-XXVI-8F4K2
  participantId: uuid('participant_id').references(() => participants.id, { onDelete: 'cascade' }).notNull().unique(),
  status: varchar('status', { length: 50 }).default('RECEIVED').notNull(), // RECEIVED, APPROVED, REJECTED, CANCELLED, CHECKED_IN, NO_SHOW, COMPLETED
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
