// src/pages/staff/index.tsx

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Users } from "lucide-react";

export default function CheckinAttendeesPage() {
  const navigate = useNavigate();

  const handleStartScan = () => {
    navigate("/event-attendees/staff-scan");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-full max-w-md shadow-2xl rounded-2xl border-blue-100">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Users className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-semibold text-blue-700">
              Staff Check-In Portal
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Welcome to the event staff portal. You can scan attendee QR codes
              to check them in.
            </p>

            <Button
              onClick={handleStartScan}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 w-full"
            >
              <QrCode className="mr-2 h-5 w-5" />
              Start Scanning
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
