"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toggleAdminStatus, changeAdminRole } from "@/actions/admin-users";
import { Role } from "@/lib/authorization";

interface Props {
  adminId: string;
  isActive: boolean;
  currentRole: Role;
  isSelf: boolean;
}

export function AdminUserActions({ adminId, isActive, currentRole, isSelf }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleStatus = async () => {
    if (isSelf) {
      alert("You cannot disable your own account.");
      return;
    }
    
    if (!confirm(`Are you sure you want to ${isActive ? "disable" : "enable"} this admin?`)) return;
    
    setIsLoading(true);
    const result = await toggleAdminStatus(adminId, !isActive);
    if (!result.success) {
      alert(result.message);
    }
    setIsLoading(false);
  };

  const handleChangeRole = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    if (newRole === currentRole) return;
    
    if (isSelf) {
      alert("You cannot change your own role.");
      e.target.value = currentRole;
      return;
    }

    if (!confirm(`Change role to ${newRole}?`)) {
      e.target.value = currentRole;
      return;
    }

    setIsLoading(true);
    const result = await changeAdminRole(adminId, newRole);
    if (!result.success) {
      alert(result.message);
      e.target.value = currentRole;
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <select 
        value={currentRole} 
        onChange={handleChangeRole} 
        disabled={isLoading || isSelf}
        className="text-xs bg-background border border-border rounded-md px-2 py-1"
      >
        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
        <option value="ADMIN">ADMIN</option>
        <option value="COMMITTEE">COMMITTEE</option>
        <option value="CHECKIN">CHECKIN</option>
        <option value="VIEWER">VIEWER</option>
      </select>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleToggleStatus} 
        disabled={isLoading || isSelf}
        className={isActive ? "text-red-500 border-red-500/20 hover:bg-red-500/10" : "text-green-500 border-green-500/20 hover:bg-green-500/10"}
      >
        {isActive ? "Disable" : "Enable"}
      </Button>
    </div>
  );
}
