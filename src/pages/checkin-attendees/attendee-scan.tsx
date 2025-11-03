import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  User,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";
import { getAttendeeInfo, type AttendeeInfo } from "@/api/checkinAPi";
import { Skeleton } from "@/components/ui/skeleton";

export default function AttendeeScanPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [attendeeInfo, setAttendeeInfo] = useState<AttendeeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid QR code: missing token");
      setLoading(false);
      return;
    }

    const fetchInfo = async () => {
      try {
        const info = await getAttendeeInfo(token);
        setAttendeeInfo(info);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load attendee information"
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchInfo();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-8 w-48 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !attendeeInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              Invalid QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {error || "Unable to load attendee information"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const qrValue = `${window.location.origin}/event/attendee/scan?token=${token}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Event Check-In</CardTitle>
          <p className="text-sm opacity-90 mt-1">{attendeeInfo.eventName}</p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-xl shadow-lg border-4 border-blue-100">
              <QRCodeSVG
                value={qrValue}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="mt-4 text-center text-sm font-medium text-blue-600 px-4">
              {attendeeInfo.message ||
                "Please show this QR code to the on-site staff for scanning"}
            </p>
          </div>

          {/* Attendee Info */}
          <div className="space-y-3 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-semibold">{attendeeInfo.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-sm">{attendeeInfo.email}</p>
              </div>
            </div>

            {attendeeInfo.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-sm">{attendeeInfo.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Check-in Status */}
          <div className="flex items-center justify-center gap-2">
            {attendeeInfo.checkInStatus ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <Badge variant="default" className="bg-green-600">
                  Already Checked In
                </Badge>
              </>
            ) : (
              <>
                <Clock className="h-5 w-5 text-amber-600" />
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-700"
                >
                  Awaiting Check-In
                </Badge>
              </>
            )}
          </div>

          {attendeeInfo.checkInStatus && attendeeInfo.checkInTime && (
            <p className="text-center text-sm text-gray-600">
              Checked in at:{" "}
              {new Date(attendeeInfo.checkInTime).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
