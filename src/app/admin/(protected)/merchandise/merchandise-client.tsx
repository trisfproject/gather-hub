"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertMerchandiseInventory } from "@/actions/admin-merchandise";
import { Plus, Check, Save } from "lucide-react";

type InventoryItem = {
  id: string;
  size: string;
  stock: number;
};

type Allocation = {
  size: string;
  count: number;
};

interface MerchandiseClientProps {
  inventory: InventoryItem[];
  allocations: Allocation[];
  canManage: boolean;
}

export function MerchandiseClient({ inventory, allocations, canManage }: MerchandiseClientProps) {
  const router = useRouter();
  
  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState("");

  const handleCreate = async () => {
    if (!newSize || !newStock || parseInt(newStock) < 0) return;
    setIsProcessing(true);
    await upsertMerchandiseInventory(newSize.toUpperCase(), parseInt(newStock));
    setNewSize("");
    setNewStock("");
    setIsProcessing(false);
    router.refresh();
  };

  const handleUpdate = async (size: string) => {
    if (!editStock || parseInt(editStock) < 0) return;
    setIsProcessing(true);
    await upsertMerchandiseInventory(size, parseInt(editStock));
    setEditingId(null);
    setEditStock("");
    setIsProcessing(false);
    router.refresh();
  };

  // Merge inventory and allocations for display
  const displayData = inventory.map(item => {
    const allocated = allocations.find(a => a.size === item.size)?.count || 0;
    return {
      ...item,
      allocated,
      remaining: item.stock - allocated
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Merchandise Inventory</h1>
        <p className="text-secondary mt-1">Manage T-shirt sizes, stock levels, and view allocations.</p>
      </div>

      {canManage && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Add New Size</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Size (e.g. XL)" 
              value={newSize}
              onChange={e => setNewSize(e.target.value)}
              className="flex-1 h-10 px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input 
              type="number" 
              placeholder="Stock Quantity" 
              value={newStock}
              onChange={e => setNewStock(e.target.value)}
              min="0"
              className="flex-1 h-10 px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={handleCreate}
              disabled={isProcessing || !newSize || !newStock}
              className="flex items-center justify-center px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 disabled:opacity-50 text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Size
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-secondary uppercase bg-surface border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Size</th>
              <th className="px-6 py-4 font-semibold text-right">Total Stock</th>
              <th className="px-6 py-4 font-semibold text-right">Allocated</th>
              <th className="px-6 py-4 font-semibold text-right">Remaining</th>
              {canManage && <th className="px-6 py-4 font-semibold text-right w-32">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayData.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-6 py-12 text-center text-secondary">
                  No merchandise inventory configured yet.
                </td>
              </tr>
            ) : (
              displayData.map((item) => (
                <tr key={item.id} className="hover:bg-border/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{item.size}</td>
                  <td className="px-6 py-4 text-right">
                    {editingId === item.id ? (
                      <input 
                        type="number" 
                        value={editStock}
                        onChange={e => setEditStock(e.target.value)}
                        className="w-20 px-2 py-1 bg-background border border-border rounded text-sm text-foreground text-right"
                        min="0"
                      />
                    ) : (
                      <span className="text-foreground font-mono">{item.stock}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-amber-500">{item.allocated}</td>
                  <td className="px-6 py-4 text-right font-mono">
                    <span className={item.remaining < 0 ? 'text-red-500 font-bold' : item.remaining === 0 ? 'text-secondary' : 'text-green-500'}>
                      {item.remaining}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-6 py-4 text-right">
                      {editingId === item.id ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleUpdate(item.size)}
                            disabled={isProcessing}
                            className="p-1.5 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-surface border border-border text-foreground rounded hover:bg-border"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setEditingId(item.id);
                            setEditStock(item.stock.toString());
                          }}
                          className="text-xs px-3 py-1.5 bg-surface border border-border text-foreground rounded hover:bg-border transition-colors font-medium"
                        >
                          Edit Stock
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
