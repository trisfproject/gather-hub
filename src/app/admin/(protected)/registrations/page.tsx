import { requirePermission } from "@/lib/authorization";
import { db } from "@/db";
import { registrations, participants, professionalProfiles } from "@/db/schema";
import { eq, ilike, or, and, desc, sql } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminRegistrationsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await requirePermission("registrations", "read");
  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 25;
  const validPageSizes = [25, 50, 100];
  const limit = validPageSizes.includes(pageSize) ? pageSize : 25;
  const offset = (page - 1) * limit;

  const searchQuery = searchParams.q as string || "";
  const statusFilter = searchParams.status as string || "";

  // Build conditions
  const conditions = [];

  if (searchQuery) {
    const searchPattern = `%${searchQuery}%`;
    conditions.push(
      or(
        ilike(registrations.registrationId, searchPattern),
        ilike(participants.fullName, searchPattern),
        ilike(participants.email, searchPattern),
        ilike(participants.whatsapp, searchPattern)
      )
    );
  }

  if (statusFilter) {
    conditions.push(eq(registrations.status, statusFilter));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Execute queries
  const [countResult, data] = await Promise.all([
    db.select({ count: sql<number>`count(*)` })
      .from(registrations)
      .innerJoin(participants, eq(registrations.participantId, participants.id))
      .where(whereClause),
    
    db.select({
      id: registrations.id,
      registrationId: registrations.registrationId,
      status: registrations.status,
      createdAt: registrations.createdAt,
      participant: {
        fullName: participants.fullName,
        email: participants.email,
        whatsapp: participants.whatsapp,
      },
      professional: {
        companyName: professionalProfiles.companyName,
        industrialArea: professionalProfiles.industrialArea,
      }
    })
    .from(registrations)
    .innerJoin(participants, eq(registrations.participantId, participants.id))
    .leftJoin(professionalProfiles, eq(participants.id, professionalProfiles.participantId))
    .where(whereClause)
    .orderBy(desc(registrations.createdAt))
    .limit(limit)
    .offset(offset)
  ]);

  const totalCount = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registrations</h1>
          <p className="text-sm text-secondary">Manage and review participant registrations.</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-surface border-border">
        <form className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search ID, name, email, WhatsApp..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <select 
            name="status" 
            defaultValue={statusFilter}
            className="px-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All Statuses</option>
            <option value="RECEIVED">RECEIVED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <Button type="submit" variant="primary">Filter</Button>
        </form>
      </Card>

      {/* Table */}
      <Card className="bg-surface border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-secondary uppercase bg-background/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Registration ID</th>
                <th className="px-4 py-3 font-medium">Participant</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Professional</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{row.registrationId}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{row.participant.fullName}</td>
                  <td className="px-4 py-3">
                    <div className="text-foreground">{row.participant.email}</div>
                    <div className="text-xs text-secondary">{row.participant.whatsapp}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="text-foreground">{row.professional?.companyName}</div>
                    <div className="text-xs text-secondary">{row.professional?.industrialArea}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      row.status === 'APPROVED' ? 'bg-green-500/10 text-green-600' :
                      row.status === 'REJECTED' ? 'bg-red-500/10 text-red-600' :
                      row.status === 'RECEIVED' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-gray-500/10 text-gray-600'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/registrations/${row.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-secondary">
                    No registrations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <div className="text-sm text-secondary">
              Showing {offset + 1} to {Math.min(offset + limit, totalCount)} of {totalCount}
            </div>
            <div className="flex gap-2">
              <Link href={`?page=${Math.max(1, page - 1)}&pageSize=${limit}&q=${searchQuery}&status=${statusFilter}`}>
                <Button variant="outline" size="sm" disabled={page <= 1}>Previous</Button>
              </Link>
              <Link href={`?page=${Math.min(totalPages, page + 1)}&pageSize=${limit}&q=${searchQuery}&status=${statusFilter}`}>
                <Button variant="outline" size="sm" disabled={page >= totalPages}>Next</Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
