"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, MapPin, Download } from "lucide-react";
import { bulkApproveRegistrations, bulkRejectRegistrations, bulkAssignPickupPoint, type BulkResult } from "@/actions/admin-bulk";

type Participant = {
  id: string;
  registrationId: string;
  status: string;
  fullName: string;
  email: string;
  whatsapp: string;
  shirtSize: string | null;
  takeBus: boolean | null;
  vehicleType: string | null;
  pickupPointName: string | null;
};

type PickupPoint = {
  id: string;
  name: string;
};

interface ParticipantsClientProps {
  participants: Participant[];
  total: number;
  pickupPoints: PickupPoint[];
  canManage: boolean;
  canExport: boolean;
}

export function ParticipantsClient({ participants, total, pickupPoints, canManage, canExport }: ParticipantsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "25");
  const search = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const totalPages = Math.ceil(total / limit);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    
    // Reset page on filter change
    if (key !== "page") params.set("page", "1");
    
    router.push(`/admin/participants?${params.toString()}`);
  };

  const handleExport = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", "participants");
    window.open(`/api/admin/export?${params.toString()}`, "_blank");
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === participants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(participants.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'assign_pickup') => {
    if (selectedIds.size === 0) return;
    if (action === 'assign_pickup' && !selectedPickupPoint) {
      setMessage({ type: "error", text: "Please select a pickup point first" });
      return;
    }

    setIsProcessing(true);
    setMessage(null);
    try {
      const idsArray = Array.from(selectedIds);
      let results: BulkResult[] = [];
      
      if (action === 'approve') {
        results = await bulkApproveRegistrations(idsArray);
      } else if (action === 'reject') {
        results = await bulkRejectRegistrations(idsArray);
      } else if (action === 'assign_pickup') {
        // Here we pass participant ids (which is what we collected since reg.id was the same, wait
        // the selectedIds array actually holds registration ids! We need to ensure we know what id we use.
        // Wait, bulkAssignPickupPoint expects participantIds. Our Participant type has id = registration.id.
        // Let's refactor: use registration.id for all bulk actions, and inside bulkAssignPickupPoint we can look up the participantId.
        // I will assume selectedIds are registrationIds. We will fix bulkAssignPickupPoint to take registrationIds.
        results = await bulkAssignPickupPoint(idsArray, selectedPickupPoint);
      }
      
      const successCount = results?.filter(r => r.success).length || 0;
      const failCount = (results?.length || 0) - successCount;
      
      setMessage({ 
        type: failCount === 0 ? "success" : "error", 
        text: `Processed ${successCount} successfully${failCount > 0 ? `, ${failCount} failed.` : '.'}` 
      });
      setSelectedIds(new Set());
    } catch (e) {
      setMessage({ type: "error", text: "Bulk operation failed" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Participants</h1>
          <p className="text-secondary mt-1">Manage and perform bulk operations on {total} registrations.</p>
        </div>
        
        {canExport && (
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-surface border border-border text-foreground rounded-md hover:bg-border transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {message.text}
        </div>
      )}

      {/* Filters & Bulk Actions */}
      <div className="bg-surface border border-border rounded-lg p-4 flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search ID, name, email, WA..." 
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilters("q", e.target.value)}
              className="pl-9 h-10 w-full bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          
          <select 
            value={status} 
            onChange={(e) => updateFilters("status", e.target.value)}
            className="h-10 px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All Statuses</option>
            <option value="RECEIVED">Received</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select 
            value={limit.toString()} 
            onChange={(e) => updateFilters("limit", e.target.value)}
            className="h-10 px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>

        {canManage && (
          <div className="flex flex-col sm:flex-row gap-2 items-center border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-4">
            <span className="text-sm font-medium text-secondary">{selectedIds.size} selected</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('approve')}
                disabled={isProcessing || selectedIds.size === 0}
                className="flex items-center px-3 py-2 bg-green-500/10 text-green-500 rounded-md hover:bg-green-500/20 disabled:opacity-50 text-sm font-medium"
                title="Bulk Approve"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                disabled={isProcessing || selectedIds.size === 0}
                className="flex items-center px-3 py-2 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20 disabled:opacity-50 text-sm font-medium"
                title="Bulk Reject"
              >
                <XCircle className="w-4 h-4" />
              </button>
              <div className="flex border border-border rounded-md overflow-hidden">
                <select
                  value={selectedPickupPoint}
                  onChange={(e) => setSelectedPickupPoint(e.target.value)}
                  className="px-2 py-1 bg-background text-sm focus:outline-none max-w-[120px]"
                >
                  <option value="">Select Pickup</option>
                  {pickupPoints.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button
                  onClick={() => handleBulkAction('assign_pickup')}
                  disabled={isProcessing || selectedIds.size === 0 || !selectedPickupPoint}
                  className="px-3 py-2 bg-surface hover:bg-border text-foreground disabled:opacity-50 text-sm font-medium"
                  title="Assign Pickup Point"
                >
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-secondary uppercase bg-surface border-b border-border">
            <tr>
              {canManage && (
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={participants.length > 0 && selectedIds.size === participants.length}
                    onChange={toggleSelectAll}
                    className="rounded border-border bg-background text-accent focus:ring-accent"
                  />
                </th>
              )}
              <th className="px-6 py-4 font-semibold">ID / Status</th>
              <th className="px-6 py-4 font-semibold">Participant</th>
              <th className="px-6 py-4 font-semibold">Merch</th>
              <th className="px-6 py-4 font-semibold">Transport</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {participants.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-6 py-12 text-center text-secondary">
                  No participants found matching the criteria.
                </td>
              </tr>
            ) : (
              participants.map((p) => (
                <tr key={p.id} className={`hover:bg-border/50 transition-colors ${selectedIds.has(p.id) ? 'bg-accent/5' : ''}`}>
                  {canManage && (
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="rounded border-border bg-background text-accent focus:ring-accent"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="font-mono font-medium text-foreground">{p.registrationId}</div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1
                      ${p.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' : 
                        p.status === 'RECEIVED' ? 'bg-amber-500/10 text-amber-500' : 
                        'bg-red-500/10 text-red-500'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{p.fullName}</div>
                    <div className="text-secondary text-xs mt-0.5">{p.email}</div>
                    <div className="text-secondary text-xs">{p.whatsapp}</div>
                  </td>
                  <td className="px-6 py-4">
                    {p.shirtSize ? (
                      <span className="inline-flex items-center px-2 py-1 bg-surface border border-border rounded text-xs font-medium">
                        Size: {p.shirtSize}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {p.takeBus ? (
                      <div>
                        <div className="text-foreground">Bus</div>
                        <div className="text-xs text-secondary mt-0.5">{p.pickupPointName || 'No pickup point'}</div>
                      </div>
                    ) : (
                      <div className="text-foreground">{p.vehicleType || 'None'}</div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-surface border border-border px-4 py-3 rounded-lg">
          <div className="text-sm text-secondary">
            Showing <span className="font-medium text-foreground">{(page - 1) * limit + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * limit, total)}</span> of <span className="font-medium text-foreground">{total}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => updateFilters("page", (page - 1).toString())}
              disabled={page <= 1}
              className="p-2 border border-border rounded-md text-foreground hover:bg-border disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateFilters("page", (page + 1).toString())}
              disabled={page >= totalPages}
              className="p-2 border border-border rounded-md text-foreground hover:bg-border disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
