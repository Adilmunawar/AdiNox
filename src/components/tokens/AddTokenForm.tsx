
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useTokens } from "@/context/TokenContext";
import { Plus, ScanLine, X } from "lucide-react";
import jsQR from "jsqr";

const AddTokenForm = () => {
  const { addToken } = useTokens();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "scan">("manual");
  const [scannerActive, setScannerActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const scanIntervalRef = useRef<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    issuer: "",
    secret: "",
    period: 30,
    digits: 6,
    algorithm: "SHA1",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: name === "period" || name === "digits" ? Number(value) : value }));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "manual" | "scan");
    if (value === "scan") {
      startScanner();
    } else {
      stopScanner();
    }
  };

  const startScanner = async () => {
    try {
      setScannerActive(true);
      const constraints = {
        video: {
          facingMode: "environment"
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Start scanning for QR codes
        scanIntervalRef.current = window.setInterval(scanQRCode, 500);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
      setScannerActive(false);
    }
  };

  const stopScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setScannerActive(false);
  };

  const scanQRCode = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      
      if (code) {
        console.log("Found QR code", code.data);
        processScannedCode(code.data);
      }
    } catch (error) {
      console.error("QR scanning error:", error);
    }
  };

  const processScannedCode = (qrCode: string) => {
    try {
      // Parse the otpauth URI
      // Format: otpauth://totp/ISSUER:ACCOUNT?secret=SECRET&issuer=ISSUER&algorithm=ALGORITHM&digits=DIGITS&period=PERIOD
      if (qrCode.startsWith("otpauth://")) {
        // Stop the scanner
        stopScanner();
        
        const uri = new URL(qrCode);
        const params = new URLSearchParams(uri.search);
        
        // Extract the path components
        const path = uri.pathname.substring(1); // Remove leading slash
        const pathParts = path.split(":");
        
        let issuer = params.get("issuer") || "";
        const secret = params.get("secret") || "";
        const algorithm = params.get("algorithm") || "SHA1";
        const digits = parseInt(params.get("digits") || "6", 10);
        const period = parseInt(params.get("period") || "30", 10);
        
        let name = "";
        
        if (pathParts.length > 1) {
          // If path is in format ISSUER:ACCOUNT
          if (!issuer) issuer = pathParts[0];
          name = pathParts[1];
        } else {
          // If path is just ACCOUNT
          name = pathParts[0];
        }
        
        // Update form data with extracted values
        setFormData({
          name,
          issuer,
          secret,
          algorithm: algorithm as "SHA1" | "SHA256" | "SHA512",
          digits,
          period
        });
        
        // Switch back to manual tab to review the scanned data
        setActiveTab("manual");
        
        toast({
          title: "QR Code Scanned",
          description: "Token details extracted successfully. Please review before adding.",
        });
      } else {
        toast({
          title: "Invalid QR Code",
          description: "The scanned code is not a valid authentication token.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      toast({
        title: "Processing Error",
        description: "Could not process the QR code.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.secret) {
      return;
    }

    addToken({
      name: formData.name,
      issuer: formData.issuer || formData.name,
      secret: formData.secret.replace(/\s/g, ""),
      period: formData.period,
      digits: formData.digits,
      algorithm: formData.algorithm,
    });

    // Reset form and close dialog
    setFormData({
      name: "",
      issuer: "",
      secret: "",
      period: 30,
      digits: 6,
      algorithm: "SHA1",
    });
    setOpen(false);
  };

  // Cleanup scanner when dialog is closed
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      stopScanner();
      setActiveTab("manual");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full flex items-center justify-center gap-2 btn-premium shadow-glow-md hover:shadow-glow-lg transition-all duration-300 group">
          <Plus className="h-5 w-5 transition-transform group-hover:rotate-90 duration-300" /> 
          <span className="font-semibold">Add Token</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glass-morphism border-primary/20 shadow-glow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Add New Token
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/90">
            Enter the details for your new authentication token or scan a QR code.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="scan">Scan QR Code</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Account
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="col-span-3"
                    placeholder="username@example.com"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="issuer" className="text-right">
                    Issuer
                  </Label>
                  <Input
                    id="issuer"
                    name="issuer"
                    value={formData.issuer}
                    onChange={handleChange}
                    className="col-span-3"
                    placeholder="Google, GitHub, etc."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="secret" className="text-right">
                    Secret Key
                  </Label>
                  <Input
                    id="secret"
                    name="secret"
                    value={formData.secret}
                    onChange={handleChange}
                    className="col-span-3"
                    placeholder="Base32 secret key"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="algorithm" className="text-right">
                    Algorithm
                  </Label>
                  <Select
                    value={formData.algorithm}
                    onValueChange={(value) => handleSelectChange("algorithm", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SHA1">SHA1</SelectItem>
                      <SelectItem value="SHA256">SHA256</SelectItem>
                      <SelectItem value="SHA512">SHA512</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="period" className="text-right">
                    Period
                  </Label>
                  <Select
                    value={formData.period.toString()}
                    onValueChange={(value) => handleSelectChange("period", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">60 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="digits" className="text-right">
                    Digits
                  </Label>
                  <Select
                    value={formData.digits.toString()}
                    onValueChange={(value) => handleSelectChange("digits", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Digits" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 digits</SelectItem>
                      <SelectItem value="8">8 digits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Token</Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="scan" className="flex flex-col items-center justify-center">
            <div className="relative w-full aspect-square border border-dashed border-gray-300 rounded-md overflow-hidden mb-4">
              {scannerActive ? (
                <>
                  <video
                    ref={videoRef}
                    className="absolute inset-0 h-full w-full object-cover"
                    muted
                    playsInline
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 h-full w-full object-cover hidden"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="relative w-3/4 aspect-square border-2 border-primary border-opacity-80 rounded-lg">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Position the QR code within the frame</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <ScanLine className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-center text-sm text-muted-foreground">
                    Camera access required to scan QR codes
                  </p>
                </div>
              )}
            </div>
            <Button 
              type="button" 
              variant={scannerActive ? "destructive" : "default"} 
              onClick={scannerActive ? stopScanner : startScanner}
              className="w-full"
            >
              {scannerActive ? (
                <>
                  <X className="h-4 w-4 mr-2" /> Stop Scanner
                </>
              ) : (
                <>
                  <ScanLine className="h-4 w-4 mr-2" /> Start Scanner
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Scan a QR code from your authenticator app or service provider
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddTokenForm;
