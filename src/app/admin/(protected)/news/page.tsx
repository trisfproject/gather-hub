import { requirePermission } from "@/lib/authorization";
import { db } from "@/db";
import { news } from "@/db/schema";
import { Card } from "@/components/ui/card";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminNewsPage() {
  const { user } = await requirePermission("news", "read");
  const canManage = user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "COMMITTEE";

  const newsList = await db.select().from(news).orderBy(desc(news.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">News Management</h1>
          <p className="text-sm text-secondary">Manage event news and updates.</p>
        </div>
        {canManage && (
          <Button variant="primary" disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add News (Coming Soon)
          </Button>
        )}
      </div>

      <Card className="bg-surface border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-secondary uppercase bg-background/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Published At</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {newsList.map((item) => (
                <tr key={item.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{item.title}</td>
                  <td className="px-4 py-3 text-secondary">{item.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-600' :
                      item.status === 'ARCHIVED' ? 'bg-red-500/10 text-red-600' :
                      'bg-amber-500/10 text-amber-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-secondary">
                    {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm" disabled>Edit</Button>
                  </td>
                </tr>
              ))}
              {newsList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-secondary">
                    No news articles created.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
