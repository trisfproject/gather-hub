"use server";

import { db } from "@/db";
import { 
  participants, 
  professionalProfiles, 
  transportProfiles, 
  departureProfiles, 
  merchandisePreferences, 
  registrationConsents, 
  registrations 
} from "@/db/schema";
import { registrationSchema } from "@/lib/validations/registration";
import { 
  calculateAvailableSeats, 
  generateRegistrationId, 
  normalizeEmail, 
  normalizeWhatsapp 
} from "@/lib/registration-utils";

export async function submitRegistration(formData: unknown) {
  try {
    const validatedData = registrationSchema.parse(formData);

    const email = normalizeEmail(validatedData.email);
    const whatsapp = normalizeWhatsapp(validatedData.whatsapp);

    // Duplicate protection is handled by DB unique constraints on email and whatsapp.

    // 2. Compute dependent values
    let calculatedSeats = null;
    if (validatedData.vehicleType === "MOBIL" && validatedData.carRows) {
      calculatedSeats = calculateAvailableSeats(validatedData.carRows);
    }
    
    // 3. Transactional Insert with Collision Retry
    let registrationIdStr = "";
    let retryCount = 0;
    const MAX_RETRIES = 3;
    let success = false;

    while (!success && retryCount < MAX_RETRIES) {
      registrationIdStr = generateRegistrationId();
      
      try {
        await db.transaction(async (tx) => {
          // a. Participant
          const [participant] = await tx.insert(participants).values({
            fullName: validatedData.fullName,
            email,
            whatsapp,
            cityRegency: validatedData.cityRegency,
            telegramUsername: validatedData.telegramUsername,
          }).returning({ id: participants.id });

          const pId = participant.id;

          // b. Professional Profile
          await tx.insert(professionalProfiles).values({
            participantId: pId,
            companyName: validatedData.companyName,
            industrialArea: validatedData.industrialArea,
            industrialAreaOther: validatedData.industrialAreaOther,
          });

          // c. Transport Profile
          await tx.insert(transportProfiles).values({
            participantId: pId,
            takeBus: validatedData.takeBus,
            pickupPointId: validatedData.pickupPointId,
            vehicleType: validatedData.vehicleType,
            licensePlate: validatedData.vehicleType === "MOBIL" ? validatedData.licensePlate : null,
            carRows: validatedData.vehicleType === "MOBIL" ? validatedData.carRows : null,
            availableSeats: calculatedSeats,
          });

          // d. Departure Profile
          await tx.insert(departureProfiles).values({
            participantId: pId,
            departureArea: validatedData.departureArea,
            departureDetail: validatedData.departureDetail,
          });

          // e. Merchandise Preference
          if (validatedData.shirtSize && validatedData.shirtSize !== "NONE") {
            await tx.insert(merchandisePreferences).values({
              participantId: pId,
              shirtSize: validatedData.shirtSize,
            });
          }

          // f. Consents
          await tx.insert(registrationConsents).values({
            participantId: pId,
            attendanceConfirmation: validatedData.attendanceConfirmation,
            dataConsent: validatedData.dataConsent,
            invitationRequested: validatedData.invitationRequested,
          });

          // g. Registration
          await tx.insert(registrations).values({
            participantId: pId,
            registrationId: registrationIdStr,
            status: "RECEIVED",
          });
        });
        
        success = true;
      } catch (txError: unknown) {
        // Check for unique constraint violation
        let code = '';
        let detail = '';
        
        if (txError && typeof txError === 'object') {
          const errObj = txError as Record<string, unknown>;
          if ('code' in errObj) {
            code = String(errObj.code);
            detail = String(errObj.detail || '');
          } else if ('cause' in errObj && typeof errObj.cause === 'object') {
            const cause = errObj.cause as Record<string, unknown>;
            if (cause && 'code' in cause) {
              code = String(cause.code);
              detail = String(cause.detail || '');
            }
          }
        }

        if (code === '23505') {
          // If the conflict is on registrationId, retry
          if (detail.includes('registration_id')) {
            retryCount++;
            continue;
          }
          // If the conflict is on email
          if (detail.includes('email')) {
            return { success: false, message: "A registration with this email already exists." };
          }
        }
        // If it's not a collision we can handle, rethrow
        throw txError;
      }
    }
    
    if (!success) {
      throw new Error("Failed to generate a unique registration ID after multiple attempts.");
    }

    return { 
      success: true, 
      registrationId: registrationIdStr 
    };
  } catch (error: unknown) {
    console.error({ code: "REGISTRATION_FAILED" }, "Registration failed");
    
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return { success: false, message: "Validation failed. Please check your inputs." };
    }
    
    return { success: false, message: "An unexpected error occurred. Please try again later." };
  }
}
