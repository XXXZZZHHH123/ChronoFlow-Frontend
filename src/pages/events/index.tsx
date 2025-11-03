import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTableLoading } from "@/components/data-table/data-table-skeleton";
import { useOrgEvents } from "@/hooks/events/useOrgEvents";
import { OrgEventColumns } from "./components/get-events-table/columns";
import OrgEventTable from "./components/get-events-table/data-table";

export default function OrgEventsPage() {
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    onRefresh: onEventsRefresh,
  } = useOrgEvents(true);

  const columns = useMemo(
    () => OrgEventColumns(onEventsRefresh),
    [onEventsRefresh]
  );

  return (
    <Card className="rounded-lg border-none">
      <CardHeader className="pb-2">
        <CardTitle>Event Management</CardTitle>
        <CardDescription className="mt-1">
          View and manage all events within your organisation. You can create
          new events, update details, track participants, and monitor progress —
          all in one place.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {eventsLoading ? (
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <DataTableLoading columnCount={6} />
            </div>
          </div>
        ) : eventsError ? (
          <div className="py-6 text-center text-red-500">{eventsError}</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <OrgEventTable
                columns={columns}
                data={events}
                onRefresh={onEventsRefresh}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
