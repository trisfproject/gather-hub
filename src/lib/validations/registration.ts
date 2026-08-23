import { z } from "zod";

export const registrationSchema = z.object({
  // Step 1: About You
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format").max(255),
  whatsapp: z.string().min(9, "WhatsApp number is too short").max(20),
  telegramUsername: z.string().max(255).optional(),
  cityRegency: z.string().min(2, "City/Regency is required").max(100),

  // Step 2: Professional
  companyName: z.string().min(2, "Company name is required").max(255),
  industrialArea: z.string().min(1, "Please select an industrial area"),
  industrialAreaOther: z.string().max(255).optional(),

  // Step 3: Transportation
  takeBus: z.boolean().optional(),
  pickupPointId: z.string().uuid("Invalid pickup point").optional(),
  vehicleType: z.enum(["MOBIL", "MOTOR", "NONE"]),
  licensePlate: z.string().max(20).optional(),
  carRows: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number().optional()),

  // Step 4: Departure
  departureArea: z.string().min(2, "Departure area is required").max(100),
  departureDetail: z.string().max(255).optional(),

  // Step 5: Merchandise
  shirtSize: z.enum(["S", "M", "L", "XL", "XXL", "NONE"]).optional(),

  // Step 6: Consents
  attendanceConfirmation: z.boolean().refine((val) => val === true, {
    message: "You must confirm your attendance",
  }),
  dataConsent: z.boolean().refine((val) => val === true, {
    message: "You must consent to data processing",
  }),
  invitationRequested: z.boolean().optional(),
}).superRefine((data, ctx) => {
  // Conditional: Industrial Area Other
  if (data.industrialArea === "Other / Non-industrial Area" && !data.industrialAreaOther?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify your industrial area",
      path: ["industrialAreaOther"],
    });
  }

  // Conditional: Bus
  if (data.takeBus && !data.pickupPointId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select a pickup point",
      path: ["pickupPointId"],
    });
  }

  // Conditional: Vehicle
  if (data.vehicleType === "MOBIL") {
    if (!data.licensePlate?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "License plate is required for cars",
        path: ["licensePlate"],
      });
    }
    if (data.carRows !== 2 && data.carRows !== 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Car rows must be 2 or 3",
        path: ["carRows"],
      });
    }
  }
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;
