
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useTokens } from "@/context/TokenContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus, ScanLine, X, KeyRound } from "lucide-react";
import jsQR from "jsqr";
import { motion } from "framer-motion";

interface AddTokenFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AddTokenForm = ({ open: externalOpen, onOpenChange: externalOnOpenChange }: AddTokenFormProps) => {
  const { addToken } = useTokens();
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "scan">("manual");
  const [scannerActive, setScannerActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const scanIntervalRef = useRef<number | null>(null);
  const isMobile = useIsMobile();

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const [formData, setFormData] = useState({
    name: "", issuer: "", secret: "", period: 30, digits: 6, algorithm: "SHA1",
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
    if (value === "scan") startScanner();
    else stopScanner();
  };

  const startScanner = async () => {
    try {
      setScannerActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scanIntervalRef.current = window.setInterval(scanQRCode, 500);
      }
    } catch (error) {
      toast({ title: "Camera Error", description: "Could not access your camera.", variant: "destructive" });
      setScannerActive(false);
    }
  };

  const stopScanner = () => {
    if (scanIntervalRef.current) { clearInterval(scanIntervalRef.current); scanIntervalRef.current = null; }
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setScannerActive(false);
  };

  const scanQRCode = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
      if (code) processScannedCode(code.data);
    } catch (error) { console.error("QR scanning error:", error); }
  };

  const processScannedCode = (qrCode: string) => {
    try {
      if (qrCode.startsWith("otpauth://")) {
        stopScanner();
        const uri = new URL(qrCode);
        const params = new URLSearchParams(uri.search);
        const path = uri.pathname.substring(1);
        const pathParts = path.split(":");
        let issuer = params.get("issuer") || "";
        const secret = params.get("secret") || "";
        const algorithm = params.get("algorithm") || "SHA1";
        const digits = parseInt(params.get("digits") || "6", 10);
        const period = parseInt(params.get("period") || "30", 10);
        let name = "";
        if (pathParts.length > 1) { if (!issuer) issuer = pathParts[0]; name = pathParts[1]; }
        else name = pathParts[0];
        setFormData({ name, issuer, secret, algorithm, digits, period });
        setActiveTab("manual");
        toast({ title: "QR Code Scanned", description: "Token details extracted. Please review." });
      } else {
        toast({ title: "Invalid QR Code", description: "Not a valid authentication token.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Processing Error", description: "Could not process the QR code.", variant: "destructive" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.secret) return;
    addToken({
      name: formData.name,
      issuer: formData.issuer || formData.name,
      secret: formData.secret.replace(/\s/g, ""),
      period: formData.period,
      digits: formData.digits,
      algorithm: formData.algorithm,
    });
    setFormData({ name: "", issuer: "", secret: "", period: 30, digits: 6, algorithm: "SHA1" });
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) { stopScanner(); setActiveTab("manual"); }
  };

  const inputClass = "h-10 bg-secondary/30 border-border/50 rounded-lg text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all";

  const formContent = (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-2 h-9 p-0.5 bg-secondary/30 rounded-lg">
        <TabsTrigger value="manual" className="text-xs rounded-md h-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Manual Entry</TabsTrigger>
        <TabsTrigger value="scan" className="text-xs rounded-md h-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Scan QR Code</TabsTrigger>
      </TabsList>
      <TabsContent value="manual">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-3 py-4">
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="name" className="text-right text-xs text-muted-foreground">Account</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} className={`col-span-3 ${inputClass}`} placeholder="username@example.com" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="issuer" className="text-right text-xs text-muted-foreground">Issuer</Label>
              <Input id="issuer" name="issuer" value={formData.issuer} onChange={handleChange} className={`col-span-3 ${inputClass}`} placeholder="Google, GitHub, etc." />
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="secret" className="text-right text-xs text-muted-foreground">Secret</Label>
              <Input id="secret" name="secret" value={formData.secret} onChange={handleChange} className={`col-span-3 ${inputClass}`} placeholder="Base32 secret key" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label className="text-right text-xs text-muted-foreground">Algorithm</Label>
              <Select value={formData.algorithm} onValueChange={(v) => handleSelectChange("algorithm", v)}>
                <SelectTrigger className={`col-span-3 ${inputClass}`}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHA1">SHA1</SelectItem>
                  <SelectItem value="SHA256">SHA256</SelectItem>
                  <SelectItem value="SHA512">SHA512</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label className="text-right text-xs text-muted-foreground">Period</Label>
              <Select value={formData.period.toString()} onValueChange={(v) => handleSelectChange("period", v)}>
                <SelectTrigger className={`col-span-3 ${inputClass}`}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">60 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label className="text-right text-xs text-muted-foreground">Digits</Label>
              <Select value={formData.digits.toString()} onValueChange={(v) => handleSelectChange("digits", v)}>
                <SelectTrigger className={`col-span-3 ${inputClass}`}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 digits</SelectItem>
                  <SelectItem value="8">8 digits</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className={isMobile ? "" : ""}>
            <Button type="submit" className="w-full rounded-xl h-10 text-sm shadow-md shadow-primary/10">
              <Plus className="h-4 w-4 mr-1.5" /> Add Token
            </Button>
          </div>
        </form>
      </TabsContent>
      <TabsContent value="scan" className="flex flex-col items-center justify-center">
        <div className="relative w-full aspect-square border border-border/30 rounded-xl overflow-hidden mb-4 bg-secondary/20">
          {scannerActive ? (
            <>
              <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" muted playsInline />
              <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover hidden" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative w-3/4 aspect-square border-2 border-primary/60 rounded-xl">
                  <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary rounded-br-lg" />
                  <motion.div className="absolute inset-x-2 h-0.5 bg-primary/60" animate={{ y: ['0%', '100%', '0%'] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
                </div>
                <p className="text-xs text-muted-foreground mt-3">Position QR code within frame</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <ScanLine className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground/60">Camera access required</p>
            </div>
          )}
        </div>
        <Button type="button" variant={scannerActive ? "destructive" : "default"} onClick={scannerActive ? stopScanner : startScanner} className="w-full rounded-xl h-10 text-sm">
          {scannerActive ? <><X className="h-4 w-4 mr-1.5" /> Stop Scanner</> : <><ScanLine className="h-4 w-4 mr-1.5" /> Start Scanner</>}
        </Button>
      </TabsContent>
    </Tabs>
  );

  // Use Drawer on mobile, Dialog on desktop
  if (isMobile) {
    return (
      <>
        {externalOpen === undefined && (
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button className="w-full h-11 flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 group" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
              <span className="font-medium text-sm">Add Token</span>
            </Button>
          </motion.div>
        )}
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerContent className="px-4 pb-6">
            <DrawerHeader className="text-left">
              <DrawerTitle className="flex items-center gap-2 text-lg">
                <KeyRound className="h-4 w-4 text-primary" /> Add New Token
              </DrawerTitle>
              <p className="text-xs text-muted-foreground/70">Enter details manually or scan a QR code.</p>
            </DrawerHeader>
            {formContent}
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button className="w-full h-11 flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 group">
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
              <span className="font-medium text-sm">Add Token</span>
            </Button>
          </motion.div>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[460px] bg-card/95 backdrop-blur-xl border-border/30 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="h-4 w-4 text-primary" /> Add New Token
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground/70">
            Enter token details manually or scan a QR code.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default AddTokenForm;
