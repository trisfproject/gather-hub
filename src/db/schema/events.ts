import { pgTable, text, timestamp, boolean, varchar, uuid } from 'drizzle-orm/pg-core';

export const eventSettings = pgTable('event_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  registrationEnabled: boolean('registration_enabled').default(false).notNull(),
  busEnabled: boolean('bus_enabled').default(false).notNull(),
  merchandiseEnabled: boolean('merchandise_enabled').default(false).notNull(),
  invitationEnabled: boolean('invitation_enabled').default(false).notNull(),
  certificateEnabled: boolean('certificate_enabled').default(false).notNull(),
  telegramEnabled: boolean('telegram_enabled').default(false).notNull(),
  whatsappEnabled: boolean('whatsapp_enabled').default(false).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const news = pgTable('news', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content'),
  coverImage: text('cover_image'),
  publishedAt: timestamp('published_at'),
  status: varchar('status', { length: 20 }).default('DRAFT').notNull(), // DRAFT, PUBLISHED, ARCHIVED
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sharingSessions = pgTable('sharing_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title'),
  speakerName: text('speaker_name'),
  speakerRole: text('speaker_role'),
  speakerCompany: text('speaker_company'),
  speakerPhoto: text('speaker_photo'),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pickupPoints = pgTable('pickup_points', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  locationDetail: text('location_detail'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
