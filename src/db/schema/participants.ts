import { pgTable, text, timestamp, boolean, varchar, uuid, integer } from 'drizzle-orm/pg-core';
import { pickupPoints } from './events';

export const participants = pgTable('participants', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: text('full_name').notNull(),
  whatsapp: varchar('whatsapp', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  cityRegency: text('city_regency').notNull(),
  telegramUsername: varchar('telegram_username', { length: 255 }),
  telegramUserId: varchar('telegram_user_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const professionalProfiles = pgTable('professional_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  participantId: uuid('participant_id').references(() => participants.id, { onDelete: 'cascade' }).notNull().unique(),
  companyName: text('company_name').notNull(),
  industrialArea: varchar('industrial_area', { length: 100 }).notNull(),
  industrialAreaOther: text('industrial_area_other'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const transportProfiles = pgTable('transport_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  participantId: uuid('participant_id').references(() => participants.id, { onDelete: 'cascade' }).notNull().unique(),
  takeBus: boolean('take_bus').default(false).notNull(),
  pickupPointId: uuid('pickup_point_id').references(() => pickupPoints.id),
  vehicleType: varchar('vehicle_type', { length: 20 }).notNull(), // MOBIL, MOTOR, NONE
  licensePlate: varchar('license_plate', { length: 50 }),
  carRows: integer('car_rows'),
  availableSeats: integer('available_seats'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const departureProfiles = pgTable('departure_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  participantId: uuid('participant_id').references(() => participants.id, { onDelete: 'cascade' }).notNull().unique(),
  departureArea: text('departure_area').notNull(),
  departureDetail: text('departure_detail'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const merchandisePreferences = pgTable('merchandise_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  participantId: uuid('participant_id').references(() => participants.id, { onDelete: 'cascade' }).notNull().unique(),
  shirtSize: varchar('shirt_size', { length: 10 }), // S, M, L, XL, XXL
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const registrationConsents = pgTable('registration_consents', {
  id: uuid('id').defaultRandom().primaryKey(),
  participantId: uuid('participant_id').references(() => participants.id, { onDelete: 'cascade' }).notNull().unique(),
  attendanceConfirmation: boolean('attendance_confirmation').notNull(),
  dataConsent: boolean('data_consent').notNull(),
  invitationRequested: boolean('invitation_requested').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
