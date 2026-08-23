CREATE TABLE "event_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_enabled" boolean DEFAULT false NOT NULL,
	"bus_enabled" boolean DEFAULT false NOT NULL,
	"merchandise_enabled" boolean DEFAULT false NOT NULL,
	"invitation_enabled" boolean DEFAULT false NOT NULL,
	"certificate_enabled" boolean DEFAULT false NOT NULL,
	"telegram_enabled" boolean DEFAULT false NOT NULL,
	"whatsapp_enabled" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" varchar(255) NOT NULL,
	"excerpt" text,
	"content" text,
	"cover_image" text,
	"published_at" timestamp,
	"status" varchar(20) DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pickup_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"location_detail" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sharing_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text,
	"speaker_name" text,
	"speaker_role" text,
	"speaker_company" text,
	"speaker_photo" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departure_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"departure_area" text NOT NULL,
	"departure_detail" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "departure_profiles_participant_id_unique" UNIQUE("participant_id")
);
--> statement-breakpoint
CREATE TABLE "merchandise_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"shirt_size" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "merchandise_preferences_participant_id_unique" UNIQUE("participant_id")
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"whatsapp" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"city_regency" text NOT NULL,
	"telegram_username" varchar(255),
	"telegram_user_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "participants_whatsapp_unique" UNIQUE("whatsapp"),
	CONSTRAINT "participants_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "professional_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"industrial_area" varchar(100) NOT NULL,
	"industrial_area_other" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "professional_profiles_participant_id_unique" UNIQUE("participant_id")
);
--> statement-breakpoint
CREATE TABLE "registration_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"attendance_confirmation" boolean NOT NULL,
	"data_consent" boolean NOT NULL,
	"invitation_requested" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "registration_consents_participant_id_unique" UNIQUE("participant_id")
);
--> statement-breakpoint
CREATE TABLE "transport_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"take_bus" boolean DEFAULT false NOT NULL,
	"pickup_point_id" uuid,
	"vehicle_type" varchar(20) NOT NULL,
	"license_plate" varchar(50),
	"car_rows" integer,
	"available_seats" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transport_profiles_participant_id_unique" UNIQUE("participant_id")
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_id" varchar(50) NOT NULL,
	"participant_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'RECEIVED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "registrations_registration_id_unique" UNIQUE("registration_id"),
	CONSTRAINT "registrations_participant_id_unique" UNIQUE("participant_id")
);
--> statement-breakpoint
ALTER TABLE "departure_profiles" ADD CONSTRAINT "departure_profiles_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchandise_preferences" ADD CONSTRAINT "merchandise_preferences_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_consents" ADD CONSTRAINT "registration_consents_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_profiles" ADD CONSTRAINT "transport_profiles_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_profiles" ADD CONSTRAINT "transport_profiles_pickup_point_id_pickup_points_id_fk" FOREIGN KEY ("pickup_point_id") REFERENCES "public"."pickup_points"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;