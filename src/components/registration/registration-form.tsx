"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { registrationSchema, type RegistrationFormValues } from "@/lib/validations/registration";
import { submitRegistration } from "@/actions/registration";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/fade-in";
import Link from "next/link";

interface RegistrationFormProps {
  busEnabled: boolean;
  merchandiseEnabled: boolean;
  invitationEnabled: boolean;
}

const STEPS = [
  "About You",
  "Professional",
  "Transportation",
  "Departure",
  "Merchandise",
  "Confirmation",
];

export function RegistrationForm({ busEnabled, merchandiseEnabled, invitationEnabled }: RegistrationFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successId, setSuccessId] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // We filter out steps dynamically based on settings if needed, 
  // but keeping them static makes the UI progress clear. We just skip content if disabled.

  const form = useForm<RegistrationFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(registrationSchema) as any,
    defaultValues: {
      fullName: "",
      email: "",
      whatsapp: "",
      telegramUsername: "",
      cityRegency: "",
      companyName: "",
      industrialArea: "",
      industrialAreaOther: "",
      takeBus: false,
      pickupPointId: "",
      vehicleType: "NONE",
      licensePlate: "",
      carRows: undefined,
      departureArea: "",
      departureDetail: "",
      shirtSize: "NONE",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      attendanceConfirmation: undefined as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dataConsent: undefined as any,
      invitationRequested: false,
    },
    mode: "onTouched"
  });

  const { handleSubmit, trigger, watch, formState: { errors } } = form;

  const industrialArea = watch("industrialArea");
  const takeBus = watch("takeBus");
  const vehicleType = watch("vehicleType");

  const nextStep = async () => {
    // Determine fields for current step
    let fieldsToValidate: (keyof RegistrationFormValues)[] = [];
    if (currentStep === 0) fieldsToValidate = ["fullName", "email", "whatsapp", "telegramUsername", "cityRegency"];
    if (currentStep === 1) fieldsToValidate = ["companyName", "industrialArea", "industrialAreaOther"];
    if (currentStep === 2) fieldsToValidate = ["takeBus", "pickupPointId", "vehicleType", "licensePlate", "carRows"];
    if (currentStep === 3) fieldsToValidate = ["departureArea", "departureDetail"];
    if (currentStep === 4) fieldsToValidate = ["shirtSize"];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const onSubmit = async (data: RegistrationFormValues) => {
    setSubmitError(null);
    setIsSubmitting(true);
    
    const result = await submitRegistration(data);
    
    setIsSubmitting(false);
    
    if (result.success && result.registrationId) {
      setSuccessId(result.registrationId);
    } else {
      setSubmitError(result.message || "An error occurred during submission.");
    }
  };

  if (successId) {
    return (
      <FadeIn>
        <Card className="max-w-2xl mx-auto border-border bg-surface text-center py-16 px-6">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Thank you.</h2>
          <p className="text-xl text-muted-foreground mb-8">Your registration has been received.</p>
          
          <div className="bg-background border border-border rounded-lg p-6 mb-8 max-w-sm mx-auto">
            <p className="text-sm text-secondary uppercase tracking-widest mb-2 font-medium">Registration ID</p>
            <p className="text-3xl font-bold text-foreground font-mono">{successId}</p>
          </div>
          
          <p className="text-secondary max-w-md mx-auto mb-10 leading-relaxed">
            The committee will review your registration and send further event information to your registered email.
          </p>
          
          <Link href="/registration">
            <Button size="lg" className="w-full sm:w-auto">
              Check Registration Status
            </Button>
          </Link>
        </Card>
      </FadeIn>
    );
  }

  // Common Input Class
  const inputClass = "flex h-12 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
  const labelClass = "block text-sm font-medium mb-2 text-foreground";
  const errorClass = "text-sm text-red-500 mt-1 font-medium";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-10">
        <div className="flex justify-between mb-2">
          {STEPS.map((step, idx) => (
            <div 
              key={step} 
              className={`text-xs font-medium ${idx <= currentStep ? 'text-foreground' : 'text-muted-foreground hidden md:block'}`}
            >
              {idx + 1}. {step}
            </div>
          ))}
          <div className="text-xs font-medium text-foreground md:hidden">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
          </div>
        </div>
        <div className="h-2 w-full bg-border rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-accent"
            initial={false}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-8">
          {submitError}
        </div>
      )}

      <Card className="bg-surface border-border overflow-hidden relative min-h-[400px]">
        <CardContent className="p-6 md:p-10">
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {/* Step 0: About You */}
            <div className={currentStep === 0 ? "block" : "hidden"}>
              <h3 className="text-2xl font-bold mb-6">About You</h3>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input {...form.register("fullName")} className={inputClass} placeholder="John Doe" />
                  {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input type="email" {...form.register("email")} className={inputClass} placeholder="john@example.com" />
                    {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>WhatsApp Number *</label>
                    <input type="tel" {...form.register("whatsapp")} className={inputClass} placeholder="081234567890" />
                    {errors.whatsapp && <p className={errorClass}>{errors.whatsapp.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>City/Regency *</label>
                    <input {...form.register("cityRegency")} className={inputClass} placeholder="e.g. Bekasi" />
                    {errors.cityRegency && <p className={errorClass}>{errors.cityRegency.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Telegram Username</label>
                    <input {...form.register("telegramUsername")} className={inputClass} placeholder="@johndoe" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1: Professional */}
            <div className={currentStep === 1 ? "block" : "hidden"}>
              <h3 className="text-2xl font-bold mb-6">Professional Profile</h3>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Company Name *</label>
                  <input {...form.register("companyName")} className={inputClass} placeholder="PT Example Indonesia" />
                  {errors.companyName && <p className={errorClass}>{errors.companyName.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Industrial Area *</label>
                  <select {...form.register("industrialArea")} className={inputClass}>
                    <option value="">Select an area...</option>
                    <option value="Jababeka">Jababeka</option>
                    <option value="EJIP">EJIP</option>
                    <option value="Delta Silicon">Delta Silicon</option>
                    <option value="GIIC">GIIC</option>
                    <option value="MM2100">MM2100</option>
                    <option value="Other / Non-industrial Area">Other / Non-industrial Area</option>
                  </select>
                  {errors.industrialArea && <p className={errorClass}>{errors.industrialArea.message}</p>}
                </div>
                {industrialArea === "Other / Non-industrial Area" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <label className={labelClass}>Specify Industrial Area / Location *</label>
                    <input {...form.register("industrialAreaOther")} className={inputClass} placeholder="e.g. KIIC Karawang" />
                    {errors.industrialAreaOther && <p className={errorClass}>{errors.industrialAreaOther.message}</p>}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Step 2: Transportation */}
            <div className={currentStep === 2 ? "block" : "hidden"}>
              <h3 className="text-2xl font-bold mb-6">Transportation</h3>
              <div className="space-y-8">
                
                {busEnabled && (
                  <div className="bg-background border border-border p-5 rounded-lg space-y-4">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" {...form.register("takeBus")} className="w-5 h-5 rounded border-border text-accent focus:ring-accent" />
                      <span className="font-medium">Ikut bis? (Join the chartered bus)</span>
                    </label>
                    
                    {takeBus && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <label className={labelClass}>Pickup Point *</label>
                        <select {...form.register("pickupPointId")} className={inputClass} disabled>
                          <option value="">Pickup points unavailable...</option>
                        </select>
                        {errors.pickupPointId && <p className={errorClass}>{errors.pickupPointId.message}</p>}
                      </motion.div>
                    )}
                  </div>
                )}

                {!takeBus && (
                  <div className="space-y-6">
                    <div>
                      <label className={labelClass}>Vehicle Type *</label>
                      <select {...form.register("vehicleType")} className={inputClass}>
                        <option value="NONE">Tidak membawa kendaraan (None)</option>
                        <option value="MOBIL">Mobil (Car)</option>
                        <option value="MOTOR">Motor (Motorcycle)</option>
                      </select>
                    </div>

                    {vehicleType === "MOBIL" && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 border border-border rounded-lg bg-background">
                        <div>
                          <label className={labelClass}>License Plate *</label>
                          <input {...form.register("licensePlate")} className={inputClass} placeholder="B 1234 ABC" />
                          {errors.licensePlate && <p className={errorClass}>{errors.licensePlate.message}</p>}
                        </div>
                        <div>
                          <label className={labelClass}>Car Rows *</label>
                          <select {...form.register("carRows")} className={inputClass}>
                            <option value="">Select...</option>
                            <option value="2">2 Baris (e.g., Hatchback, Sedan)</option>
                            <option value="3">3 Baris (e.g., MPV, SUV)</option>
                          </select>
                          {errors.carRows && <p className={errorClass}>{errors.carRows.message}</p>}
                          <p className="text-xs text-muted-foreground mt-2">
                            This determines the number of available seats for carpooling.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Departure */}
            <div className={currentStep === 3 ? "block" : "hidden"}>
              <h3 className="text-2xl font-bold mb-6">Departure Information</h3>
              <p className="text-secondary mb-6">This helps the committee plot carpools and bus routing.</p>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Departure Area *</label>
                  <input {...form.register("departureArea")} className={inputClass} placeholder="e.g. Cikarang Pusat" />
                  {errors.departureArea && <p className={errorClass}>{errors.departureArea.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Departure Detail (Optional)</label>
                  <input {...form.register("departureDetail")} className={inputClass} placeholder="e.g. Perumahan Tropikana" />
                </div>
              </div>
            </div>

            {/* Step 4: Merchandise */}
            <div className={currentStep === 4 ? "block" : "hidden"}>
              <h3 className="text-2xl font-bold mb-6">Merchandise</h3>
              {merchandiseEnabled ? (
                <div className="space-y-6">
                  <p className="text-secondary mb-4">Please select your shirt size.</p>
                  <div>
                    <label className={labelClass}>Shirt Size</label>
                    <select {...form.register("shirtSize")} className={inputClass}>
                      <option value="NONE">No Shirt / Skip</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-background border border-border rounded-lg">
                  <p className="text-muted-foreground">Merchandise selection is currently not available.</p>
                </div>
              )}
            </div>

            {/* Step 5: Confirmation */}
            <div className={currentStep === 5 ? "block" : "hidden"}>
              <h3 className="text-2xl font-bold mb-6">Final Confirmation</h3>
              <div className="space-y-6">
                <label className="flex items-start space-x-3 p-4 border border-border rounded-lg bg-background cursor-pointer hover:bg-background/80 transition-colors">
                  <input type="checkbox" {...form.register("attendanceConfirmation")} className="mt-1 w-5 h-5 rounded border-border text-accent focus:ring-accent" />
                  <div>
                    <span className="font-bold block text-foreground">I confirm my attendance</span>
                    <span className="text-sm text-secondary">I commit to attending KOMITKABE Gathering XXVI in person.</span>
                  </div>
                </label>
                {errors.attendanceConfirmation && <p className={errorClass}>{errors.attendanceConfirmation.message as string}</p>}

                <label className="flex items-start space-x-3 p-4 border border-border rounded-lg bg-background cursor-pointer hover:bg-background/80 transition-colors">
                  <input type="checkbox" {...form.register("dataConsent")} className="mt-1 w-5 h-5 rounded border-border text-accent focus:ring-accent" />
                  <div>
                    <span className="font-bold block text-foreground">Data Processing Consent</span>
                    <span className="text-sm text-secondary">I agree that my submitted data will be used securely by the committee for event management.</span>
                  </div>
                </label>
                {errors.dataConsent && <p className={errorClass}>{errors.dataConsent.message as string}</p>}

                {invitationEnabled && (
                  <label className="flex items-start space-x-3 p-4 border border-border rounded-lg bg-background cursor-pointer hover:bg-background/80 transition-colors">
                    <input type="checkbox" {...form.register("invitationRequested")} className="mt-1 w-5 h-5 rounded border-border text-accent focus:ring-accent" />
                    <div>
                      <span className="font-bold block text-foreground">Request Official Invitation Letter</span>
                      <span className="text-sm text-secondary">Check this if your company requires a formal invitation document for your attendance.</span>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-10 pt-6 border-t border-border">
              {currentStep > 0 ? (
                <Button type="button" variant="outline" onClick={prevStep} disabled={isSubmitting}>
                  Back
                </Button>
              ) : (
                <div /> // Spacer
              )}
              
              {currentStep < STEPS.length - 1 ? (
                <Button type="button" variant="primary" onClick={nextStep} disabled={isSubmitting}>
                  Next Step
                </Button>
              ) : (
                <Button type="submit" variant="primary" disabled={isSubmitting} className="min-w-[150px]">
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
