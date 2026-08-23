"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createPickupPoint, togglePickupPointStatus } from "@/actions/admin-pickup-points";

export function PickupPointForm() {
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await createPickupPoint({
      name,
      detail
    });

    if (result.success) {
      setName("");
      setDetail("");
    } else {
      alert(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-foreground">Name</label>
          <input 
            type="text" 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full flex h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent" 
            placeholder="e.g. Cikarang (Lippo)"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground">Detail / Address</label>
          <input 
            type="text" 
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            className="mt-1 w-full flex h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent" 
            placeholder="Main Gate"
          />
        </div>
        <div className="flex items-end gap-2">
          <Button type="submit" disabled={isLoading} variant="primary" className="h-9 w-full">
            {isLoading ? "Adding..." : "Add Point"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function PickupPointToggle({ id, isActive, disabled }: { id: string, isActive: boolean, disabled: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const result = await togglePickupPointStatus(id, !isActive);
    if (!result.success) alert(result.message);
    setLoading(false);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleToggle}
      disabled={disabled || loading}
      className={isActive ? "text-red-500 border-red-500/20 hover:bg-red-500/10" : "text-green-500 border-green-500/20 hover:bg-green-500/10"}
    >
      {isActive ? "Disable" : "Enable"}
    </Button>
  );
}
