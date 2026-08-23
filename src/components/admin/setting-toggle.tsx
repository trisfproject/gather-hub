"use client";

import { useState } from "react";
import { updateEventSetting } from "@/actions/admin-settings";
import { Switch } from "@/components/ui/switch";

interface Props {
  settingKey: string;
  initialValue: string;
  label: string;
  description?: string;
  disabled: boolean;
}

export function SettingToggle({ settingKey, initialValue, label, description, disabled }: Props) {
  const [value, setValue] = useState(initialValue === "true");
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setValue(checked);
    setIsLoading(true);
    const result = await updateEventSetting(settingKey, checked.toString());
    if (!result.success) {
      alert(result.message);
      setValue(!checked); // revert
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="space-y-0.5">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {description && <p className="text-xs text-secondary">{description}</p>}
      </div>
      <Switch 
        checked={value} 
        onCheckedChange={handleToggle} 
        disabled={disabled || isLoading}
      />
    </div>
  );
}
