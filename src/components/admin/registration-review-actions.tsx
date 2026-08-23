"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { approveRegistration, rejectRegistration } from "@/actions/admin-registrations";
import { Check, X } from "lucide-react";

interface Props {
  registrationId: string;
}

export function RegistrationReviewActions({ registrationId }: Props) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this registration?")) return;
    setIsApproving(true);
    setError(null);
    const result = await approveRegistration(registrationId);
    if (!result.success) {
      setError(result.message || "An error occurred");
    }
    setIsApproving(false);
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this registration?")) return;
    setIsRejecting(true);
    setError(null);
    const result = await rejectRegistration(registrationId);
    if (!result.success) {
      setError(result.message || "An error occurred");
    }
    setIsRejecting(false);
  };

  const isLoading = isApproving || isRejecting;

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
          {error}
        </div>
      )}
      <div className="flex gap-4">
        <Button 
          onClick={handleApprove} 
          disabled={isLoading} 
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="w-4 h-4 mr-2" />
          {isApproving ? "Approving..." : "Approve"}
        </Button>
        <Button 
          onClick={handleReject} 
          disabled={isLoading} 
          variant="outline"
          className="flex-1 border-red-500/30 text-red-600 hover:bg-red-500/10"
        >
          <X className="w-4 h-4 mr-2" />
          {isRejecting ? "Rejecting..." : "Reject"}
        </Button>
      </div>
    </div>
  );
}
