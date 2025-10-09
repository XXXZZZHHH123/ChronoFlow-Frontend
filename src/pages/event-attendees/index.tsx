import { useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTableLoading } from "@/components/data-table/data-table-skeleton";
import { useEventAttendees } from "@/hooks/event-attendees/useEventAttendees";
import AttendeeTable from "./components/get-event-attendees-table/data-table";
import { AttendeeColumns } from "./components/get-event-attendees-table/columns";

export default function EventAttendeesPage() {
  const { id } = useParams<{ id: string }>();
  const eventId: string | null = id ?? null;

  const { attendees, loading, error, onRefresh } = useEventAttendees(
    eventId,
    true
  );

  const columns = useMemo(
    () => AttendeeColumns(eventId ?? "", onRefresh),
    [eventId, onRefresh]
  );

  if (!eventId) return <Navigate to="/events" replace />;

  return (
    <Card className="rounded-lg border-none">
      <CardHeader className="pb-2">
        <CardTitle>Event Attendees</CardTitle>
        <CardDescription className="mt-1">
          View and search attendees for this event. Use the search bar to filter
          by email, name, or mobile.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {loading ? (
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <DataTableLoading columnCount={3} />
            </div>
          </div>
        ) : error ? (
          <div className="py-6 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <AttendeeTable
                eventId={eventId}
                columns={columns}
                data={attendees}
                onRefresh={onRefresh}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
