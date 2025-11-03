// src/pages/event-attendees/staff-scan.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  Scan,
  UserCheck,
  AlertCircle,
  Loader2,
  Camera,
  CameraOff,
} from "lucide-react";
import { staffCheckIn, type CheckInResult } from "@/api/checkinAPi";
import Swal from "sweetalert2";
import { Html5Qrcode } from "html5-qrcode";

export default function StaffScanPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<CheckInResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrReaderInitialized = useRef(false);

  // 从URL或纯token中提取token
  const extractToken = (input: string): string => {
    const trimmedInput = input.trim();

    try {
      const url = new URL(trimmedInput);
      const tokenParam = url.searchParams.get("token");
      if (tokenParam) {
        return tokenParam;
      }
    } catch {
      // 不是有效的URL，当作纯token处理
    }

    return trimmedInput;
  };

  const handleCheckIn = useCallback(
    async (tkn?: string) => {
      const inputToken = tkn ?? token;
      const effectiveToken = extractToken(inputToken);

      if (!effectiveToken) {
        await Swal.fire({
          icon: "warning",
          title: "Token Required",
          text: "Please enter or scan a valid token",
        });
        return;
      }

      setLoading(true);
      try {
        const result = await staffCheckIn(effectiveToken);
        setLastCheckIn(result);

        await Swal.fire({
          icon: "success",
          title: "Check-In Successful!",
          html: `
          <div class="text-left space-y-2">
            <p><strong>Name:</strong> ${result.userName}</p>
            <p><strong>Event:</strong> ${result.eventName}</p>
            <p><strong>Time:</strong> ${new Date(
              result.checkInTime
            ).toLocaleString()}</p>
          </div>
        `,
          confirmButtonText: "OK",
        });

        setToken("");
      } catch (err) {
        await Swal.fire({
          icon: "error",
          title: "Check-In Failed",
          text:
            err instanceof Error ? err.message : "Unable to complete check-in",
        });
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      void handleCheckIn();
    }
  };

  // 启动扫描
  const startScanning = () => {
    if (scanning) return;
    console.log("Starting camera scan...");
    setScanning(true);
  };

  // 停止扫描
  const stopScanning = useCallback(async () => {
    console.log("Stopping camera scan...");
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      scannerRef.current = null;
      qrReaderInitialized.current = false;
    }
    setScanning(false);
  }, []);

  // 使用useEffect在DOM渲染后初始化摄像头
  useEffect(() => {
    if (scanning && !qrReaderInitialized.current) {
      const timer = setTimeout(async () => {
        const qrReaderElement = document.getElementById("qr-reader");

        if (!qrReaderElement) {
          console.error("QR reader element not found");
          setScanning(false);
          await Swal.fire({
            icon: "error",
            title: "Initialization Error",
            text: "Unable to initialize QR scanner",
          });
          return;
        }

        console.log("Initializing Html5Qrcode...");
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;
        qrReaderInitialized.current = true;

        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            async (decodedText) => {
              console.log("QR Code detected:", decodedText);
              await stopScanning();
              void handleCheckIn(decodedText);
            },
            () => {
              // 忽略扫描过程中的正常错误
            }
          );
          console.log("Camera started successfully");
        } catch (err) {
          console.error("Failed to start camera:", err);
          qrReaderInitialized.current = false;
          scannerRef.current = null;
          setScanning(false);

          await Swal.fire({
            icon: "error",
            title: "Camera Access Error",
            html: `
              <p>Unable to access camera. Please:</p>
              <ul class="text-left mt-2 space-y-1">
                <li>• Check browser permissions</li>
                <li>• Ensure you're using HTTPS or localhost</li>
                <li>• Try a different browser</li>
              </ul>
            `,
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [scanning, handleCheckIn, stopScanning]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 overflow-hidden">
        {/* 标题区域 - 无间隙 */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pb-8">
          <div className="flex items-center gap-3 justify-center">
            <UserCheck className="h-8 w-8" />
            <CardTitle className="text-3xl font-bold">
              Staff Check-In Station
            </CardTitle>
          </div>
          <CardDescription className="text-blue-50 text-center mt-2 text-base">
            Scan attendee QR codes to complete check-in
          </CardDescription>
        </CardHeader>

        {/* 内容区域 - 紧贴标题 */}
        <CardContent className="p-8 space-y-6">
          {/* 摄像头扫码区域 */}
          <div className="space-y-4">
            {scanning ? (
              <div className="flex flex-col items-center space-y-4">
                <div
                  id="qr-reader"
                  className="w-full max-w-md border-4 border-blue-400 rounded-2xl overflow-hidden shadow-xl"
                  style={{ minHeight: "300px" }}
                ></div>
                <Button
                  variant="destructive"
                  onClick={stopScanning}
                  size="lg"
                  className="w-full max-w-md shadow-lg"
                >
                  <CameraOff className="h-5 w-5 mr-2" />
                  Stop Scanning
                </Button>
                <p className="text-sm text-muted-foreground animate-pulse">
                  Point your camera at the QR code
                </p>
              </div>
            ) : (
              <Button
                onClick={startScanning}
                className="w-full h-16 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <Camera className="h-6 w-6 mr-3" />
                Use Camera to Scan QR Code
              </Button>
            )}
          </div>

          {/* 分隔线 */}
          {!scanning && (
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  OR
                </span>
              </div>
            </div>
          )}

          {/* 手动输入区 */}
          {!scanning && (
            <div className="space-y-4">
              <Label
                htmlFor="token"
                className="text-lg font-semibold text-gray-700"
              >
                Manual Token Entry
              </Label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Scan className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="token"
                    type="text"
                    placeholder="Enter token manually..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className="pl-12 h-14 text-base border-2 focus:border-blue-500 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                <Button
                  onClick={() => handleCheckIn()}
                  disabled={loading || !token.trim()}
                  className="h-14 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Check In
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p>You can paste the full URL or just the token</p>
              </div>
            </div>
          )}

          {/* 上次签到结果 */}
          {lastCheckIn && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-green-700 font-bold text-lg">
                <CheckCircle2 className="h-6 w-6" />
                Last Check-In Successful
              </div>
              <div className="grid grid-cols-1 gap-3 text-base">
                <div className="flex justify-between items-center bg-white/50 p-3 rounded-lg">
                  <span className="text-gray-600 font-medium">Attendee:</span>
                  <span className="font-semibold text-gray-900">
                    {lastCheckIn.userName}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white/50 p-3 rounded-lg">
                  <span className="text-gray-600 font-medium">Event:</span>
                  <span className="font-semibold text-gray-900">
                    {lastCheckIn.eventName}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white/50 p-3 rounded-lg">
                  <span className="text-gray-600 font-medium">Time:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(lastCheckIn.checkInTime).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
