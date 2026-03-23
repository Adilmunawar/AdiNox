import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, FileText, Trash2, MoreVertical, Search, Edit, Upload, Camera,
  CreditCard, Shield, Building2, GraduationCap, Heart, Car, Plane, X, Eye,
  Calendar, ChevronRight, Layers, Filter,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/* ── Types ── */
type VaultDocument = {
  id: string; document_type: string; title: string; document_number: string | null;
  issuer: string | null; issue_date: string | null; expiry_date: string | null;
  notes: string | null; category: string; image_front_url: string | null;
  image_back_url: string | null; color_theme: string | null;
  created_at: string; updated_at: string;
};

/* ── Config ── */
const documentTypes = [
  { value: "passport", label: "Passport", icon: Plane, category: "government" },
  { value: "national_id", label: "National ID Card", icon: CreditCard, category: "government" },
  { value: "drivers_license", label: "Driver's License", icon: Car, category: "government" },
  { value: "voter_id", label: "Voter ID", icon: Shield, category: "government" },
  { value: "social_security", label: "Social Security Card", icon: Shield, category: "government" },
  { value: "birth_certificate", label: "Birth Certificate", icon: FileText, category: "government" },
  { value: "company_id", label: "Company ID Card", icon: Building2, category: "work" },
  { value: "employee_badge", label: "Employee Badge", icon: Building2, category: "work" },
  { value: "student_id", label: "Student ID", icon: GraduationCap, category: "education" },
  { value: "diploma", label: "Diploma / Degree", icon: GraduationCap, category: "education" },
  { value: "certificate", label: "Certificate", icon: FileText, category: "education" },
  { value: "health_card", label: "Health / Insurance Card", icon: Heart, category: "financial" },
  { value: "insurance_card", label: "Insurance Policy", icon: Shield, category: "financial" },
  { value: "bank_card", label: "Bank Statement", icon: CreditCard, category: "financial" },
  { value: "tax_document", label: "Tax Document", icon: FileText, category: "financial" },
  { value: "other", label: "Other Document", icon: FileText, category: "other" },
];

const categories = [
  { value: "all", label: "All", icon: Layers },
  { value: "government", label: "Government", icon: Shield },
  { value: "work", label: "Work", icon: Building2 },
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "financial", label: "Financial", icon: CreditCard },
  { value: "other", label: "Other", icon: FileText },
];

const stagger = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

const getDocIcon = (type: string) => documentTypes.find((d) => d.value === type)?.icon || FileText;

/* ── Document Card ── */
const DocumentCard = React.memo(({
  doc, onDelete, onEdit, onView,
}: {
  doc: VaultDocument; onDelete: (id: string) => void;
  onEdit: (doc: VaultDocument) => void; onView: (doc: VaultDocument) => void;
}) => {
  const DocIcon = getDocIcon(doc.document_type);
  const typeLabel = documentTypes.find((d) => d.value === doc.document_type)?.label || doc.document_type;
  const isExpired = doc.expiry_date && new Date(doc.expiry_date) < new Date();
  const catInfo = categories.find((c) => c.value === doc.category);

  return (
    <Card
      className="relative overflow-hidden border-border/20 bg-card hover:shadow-[var(--shadow-md)] transition-all duration-300 cursor-pointer group"
      onClick={() => onView(doc)}
    >
      {/* Image area */}
      {doc.image_front_url ? (
        <div className="h-40 overflow-hidden bg-muted/10 relative">
          <img src={doc.image_front_url} alt={doc.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            <Badge className="bg-black/40 backdrop-blur-sm border-0 text-white text-[9px] font-medium px-2 py-0.5 hover:bg-black/40">
              {typeLabel}
            </Badge>
            {isExpired && (
              <Badge variant="destructive" className="text-[9px] px-2 py-0.5">Expired</Badge>
            )}
          </div>
        </div>
      ) : (
        <div className="h-32 flex items-center justify-center bg-muted/5 relative border-b border-border/10">
          <div className="h-14 w-14 rounded-2xl bg-muted/20 flex items-center justify-center">
            <DocIcon className="h-7 w-7 text-muted-foreground/15" />
          </div>
          <div className="absolute bottom-3 left-3">
            <Badge variant="outline" className="text-[9px] border-border/20 text-muted-foreground/40 font-medium px-2 py-0.5">
              {typeLabel}
            </Badge>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground truncate leading-tight">{doc.title}</h3>
            {doc.issuer && (
              <p className="text-[10px] text-muted-foreground/40 mt-0.5 truncate">{doc.issuer}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(doc); }} className="text-xs cursor-pointer gap-2">
                <Edit className="h-3 w-3" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(doc); }} className="text-xs cursor-pointer gap-2">
                <Eye className="h-3 w-3" /> View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }} className="text-destructive text-xs cursor-pointer gap-2">
                <Trash2 className="h-3 w-3" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/10">
          {doc.document_number ? (
            <span className="text-[10px] text-muted-foreground/40 font-mono tracking-wider">
              •••• {doc.document_number.slice(-4)}
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground/30">No number</span>
          )}
          {doc.expiry_date && !isExpired && (
            <span className="text-[10px] text-muted-foreground/35 flex items-center gap-1">
              <Calendar className="h-2.5 w-2.5" />
              {new Date(doc.expiry_date).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
});
DocumentCard.displayName = "DocumentCard";

/* ── Image Upload ── */
const ImageUpload = ({
  label, imageUrl, onUpload, onCapture, onRemove,
}: {
  label: string; imageUrl: string | null;
  onUpload: (file: File) => void; onCapture: () => void; onRemove: () => void;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <Label className="text-[11px] text-muted-foreground/60 mb-1.5 block font-medium">{label}</Label>
      {imageUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-border/30 h-36 group">
          <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <button onClick={onRemove}
              className="h-8 w-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
          <Button type="button" variant="outline"
            className="flex-1 h-24 rounded-xl border-dashed border-2 border-border/30 flex-col gap-1.5 hover:border-primary/30 hover:bg-primary/[0.02] transition-colors"
            onClick={() => fileRef.current?.click()}>
            <Upload className="h-5 w-5 text-muted-foreground/30" />
            <span className="text-[10px] text-muted-foreground/40 font-medium">Upload</span>
          </Button>
          <Button type="button" variant="outline"
            className="flex-1 h-24 rounded-xl border-dashed border-2 border-border/30 flex-col gap-1.5 hover:border-primary/30 hover:bg-primary/[0.02] transition-colors"
            onClick={onCapture}>
            <Camera className="h-5 w-5 text-muted-foreground/30" />
            <span className="text-[10px] text-muted-foreground/40 font-medium">Capture</span>
          </Button>
        </div>
      )}
    </div>
  );
};

/* ── Camera Capture ── */
const CameraCapture = ({ onCapture, onClose }: { onCapture: (file: File) => void; onClose: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => { streamRef.current = stream; if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch(() => onClose());
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, [onClose]);

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) onCapture(new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" }));
    }, "image/jpeg", 0.9);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="flex items-center justify-between p-4">
        <span className="text-white text-sm font-medium">Take Photo</span>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <video ref={videoRef} autoPlay playsInline className="max-w-full max-h-full rounded-2xl" />
      </div>
      <div className="p-6 flex justify-center">
        <button onClick={capture}
          className="h-16 w-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 transition-colors active:scale-95" />
      </div>
    </div>
  );
};

/* ── Color Themes ── */
const colorThemes = ["blue", "purple", "green", "red", "amber", "teal"] as const;
const colorMap: Record<string, string> = {
  blue: "bg-blue-500", purple: "bg-purple-500", green: "bg-emerald-500",
  red: "bg-red-500", amber: "bg-amber-500", teal: "bg-teal-500",
};

/* ── Main Page ── */
const DocumentsPage = () => {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingDoc, setEditingDoc] = useState<VaultDocument | null>(null);
  const [viewingDoc, setViewingDoc] = useState<VaultDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showCamera, setShowCamera] = useState<"front" | "back" | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const emptyForm = {
    title: "", document_type: "national_id", document_number: "", issuer: "",
    issue_date: "", expiry_date: "", notes: "", category: "government",
    color_theme: "blue", image_front_url: null as string | null, image_back_url: null as string | null,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("vault_documents" as any).select("*").order("updated_at", { ascending: false });
    if (error) toast({ title: "Error", description: "Failed to load documents.", variant: "destructive" });
    else setDocuments((data || []) as unknown as VaultDocument[]);
    setLoading(false);
  }, [user, toast]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("document-images").upload(path, file, { upsert: true });
    setUploading(false);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return null; }
    const { data: urlData } = supabase.storage.from("document-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleImageUpload = async (file: File, side: "front" | "back") => {
    const url = await uploadImage(file);
    if (url) setForm((f) => ({ ...f, [side === "front" ? "image_front_url" : "image_back_url"]: url }));
  };

  const handleCameraCapture = async (file: File) => {
    if (!showCamera) return;
    const url = await uploadImage(file);
    if (url) setForm((f) => ({ ...f, [showCamera === "front" ? "image_front_url" : "image_back_url"]: url }));
    setShowCamera(null);
  };

  const handleSave = async () => {
    if (!user || !form.title) return;
    const payload = {
      title: form.title, document_type: form.document_type,
      document_number: form.document_number || null, issuer: form.issuer || null,
      issue_date: form.issue_date || null, expiry_date: form.expiry_date || null,
      notes: form.notes || null, category: form.category,
      color_theme: form.color_theme, image_front_url: form.image_front_url, image_back_url: form.image_back_url,
    };
    if (editingDoc) {
      const { error } = await supabase.from("vault_documents" as any).update(payload).eq("id", editingDoc.id);
      if (error) { toast({ title: "Error", description: "Failed to update.", variant: "destructive" }); return; }
      toast({ title: "Updated", description: "Document updated successfully." });
    } else {
      const { error } = await supabase.from("vault_documents" as any).insert({ ...payload, user_id: user.id });
      if (error) { toast({ title: "Error", description: "Failed to save document.", variant: "destructive" }); return; }
      toast({ title: "Document saved", description: "Your document has been securely stored." });
    }
    resetForm();
    fetchDocuments();
  };

  const resetForm = () => { setForm(emptyForm); setIsAdding(false); setEditingDoc(null); };

  const handleEdit = (doc: VaultDocument) => {
    setEditingDoc(doc);
    setForm({
      title: doc.title, document_type: doc.document_type,
      document_number: doc.document_number || "", issuer: doc.issuer || "",
      issue_date: doc.issue_date || "", expiry_date: doc.expiry_date || "",
      notes: doc.notes || "", category: doc.category, color_theme: doc.color_theme || "blue",
      image_front_url: doc.image_front_url, image_back_url: doc.image_back_url,
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    const { error } = await supabase.from("vault_documents" as any).delete().eq("id", id);
    if (error) { toast({ title: "Error", variant: "destructive" }); return; }
    setDocuments(documents.filter((d) => d.id !== id));
    toast({ title: "Deleted", description: "Document removed." });
  };

  const handleDocTypeChange = (val: string) => {
    const dt = documentTypes.find((d) => d.value === val);
    setForm((f) => ({ ...f, document_type: val, category: dt?.category || f.category }));
  };

  const filtered = documents.filter((d) => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.document_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.issuer || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || d.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: documents.length };
    documents.forEach((d) => { counts[d.category] = (counts[d.category] || 0) + 1; });
    return counts;
  }, [documents]);

  const inputCls = "h-10 bg-muted/30 border-border/30 rounded-xl text-sm focus:border-primary/40 focus:ring-1 focus:ring-primary/10";

  const formContent = (
    <div className="space-y-4 py-2">
      <div>
        <Label className="text-[11px] text-muted-foreground/60 mb-1.5 block font-medium">Document Type</Label>
        <Select value={form.document_type} onValueChange={handleDocTypeChange}>
          <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-60">
            {documentTypes.map((dt) => (
              <SelectItem key={dt.value} value={dt.value} className="text-sm">{dt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-[11px] text-muted-foreground/60 mb-1.5 block font-medium">Title / Name</Label>
        <Input className={inputCls} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. My Passport" required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[11px] text-muted-foreground/60 mb-1.5 block font-medium">Document Number</Label>
          <Input className={inputCls} value={form.document_number} onChange={(e) => setForm((f) => ({ ...f, document_number: e.target.value }))} placeholder="Optional" />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground/60 mb-1.5 block font-medium">Issuer</Label>
          <Input className={inputCls} value={form.issuer} onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))} placeholder="e.g. Government" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[11px] text-muted-foreground/60 mb-1.5 block font-medium">Issue Date</Label>
          <Input type="date" className={inputCls} value={form.issue_date} onChange={(e) => setForm((f) => ({ ...f, issue_date: e.target.value }))} />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground/60 mb-1.5 block font-medium">Expiry Date</Label>
          <Input type="date" className={inputCls} value={form.expiry_date} onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value }))} />
        </div>
      </div>

      <ImageUpload label="Front Image" imageUrl={form.image_front_url}
        onUpload={(f) => handleImageUpload(f, "front")} onCapture={() => setShowCamera("front")}
        onRemove={() => setForm((f) => ({ ...f, image_front_url: null }))} />
      <ImageUpload label="Back Image (Optional)" imageUrl={form.image_back_url}
        onUpload={(f) => handleImageUpload(f, "back")} onCapture={() => setShowCamera("back")}
        onRemove={() => setForm((f) => ({ ...f, image_back_url: null }))} />

      <div>
        <Label className="text-[11px] text-muted-foreground/60 mb-1.5 block font-medium">Color Theme</Label>
        <div className="flex gap-2">
          {colorThemes.map((key) => (
            <button key={key} onClick={() => setForm((f) => ({ ...f, color_theme: key }))}
              className={cn("h-7 w-7 rounded-full transition-all", colorMap[key],
                form.color_theme === key ? "ring-2 ring-offset-2 ring-foreground/30 scale-110" : "opacity-60 hover:opacity-100 hover:scale-105"
              )} />
          ))}
        </div>
      </div>

      <div>
        <Label className="text-[11px] text-muted-foreground/60 mb-1.5 block font-medium">Notes</Label>
        <Textarea className="bg-muted/30 border-border/30 rounded-xl text-sm min-h-[80px] focus:border-primary/40 focus:ring-1 focus:ring-primary/10 resize-none"
          value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." />
      </div>

      <Button onClick={handleSave} className="w-full h-11 rounded-xl shadow-[var(--shadow-glow-primary)]" disabled={!form.title || uploading}>
        {uploading ? "Uploading..." : <><Plus className="h-4 w-4 mr-1.5" /> {editingDoc ? "Update Document" : "Save Document"}</>}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {showCamera && <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(null)} />}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Documents</h1>
              <p className="text-sm text-muted-foreground/50 mt-0.5">
                {documents.length} document{documents.length !== 1 ? "s" : ""} securely stored
              </p>
            </div>
          </div>
          {!isMobile && (
            <Button onClick={() => { setEditingDoc(null); setForm(emptyForm); setIsAdding(true); }}
              className="rounded-xl gap-2 shadow-[var(--shadow-glow-primary)]">
              <Plus className="h-4 w-4" /> Add Document
            </Button>
          )}
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const count = categoryCounts[cat.value] || 0;
          const active = filterCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 shrink-0",
                active
                  ? "bg-primary/10 text-primary border border-primary/15"
                  : "bg-muted/30 text-muted-foreground/50 border border-transparent hover:bg-muted/50 hover:text-muted-foreground/70"
              )}
            >
              <cat.icon className="h-3 w-3" />
              {cat.label}
              {count > 0 && (
                <span className={cn(
                  "text-[9px] font-bold tabular-nums px-1.5 py-px rounded-md",
                  active ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground/35"
                )}>{count}</span>
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
        <Input
          placeholder="Search documents, numbers, issuers..."
          className="pl-10 bg-card border-border/20 rounded-xl h-11 shadow-[var(--shadow-xs)] focus:shadow-[var(--shadow-sm)]"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-border/15">
              <div className="h-32 bg-muted/10 animate-pulse" />
              <div className="p-4 space-y-2.5">
                <div className="h-4 bg-muted/15 rounded-md animate-pulse w-3/4" />
                <div className="h-3 bg-muted/10 rounded-md animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-card rounded-2xl border border-dashed border-border/30">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/8 border border-primary/10 flex items-center justify-center mb-4">
            <FileText className="h-7 w-7 text-primary/40" />
          </div>
          <p className="text-lg font-semibold text-foreground">
            {search ? "No documents found" : "No documents yet"}
          </p>
          <p className="text-sm text-muted-foreground/50 mt-1 mb-5 max-w-xs mx-auto">
            {search ? "Try a different search term." : "Store your IDs, passports, and personal documents securely."}
          </p>
          {!search && (
            <Button onClick={() => setIsAdding(true)} className="rounded-xl shadow-[var(--shadow-glow-primary)] gap-1.5">
              <Plus className="h-4 w-4" /> Add Your First Document
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc, i) => (
            <motion.div key={doc.id} custom={i} variants={stagger} initial="hidden" animate="visible">
              <DocumentCard doc={doc} onDelete={handleDelete} onEdit={handleEdit} onView={setViewingDoc} />
            </motion.div>
          ))}
        </div>
      )}

      {/* FAB for mobile */}
      {isMobile && (
        <motion.div className="fixed bottom-20 right-4 z-50" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
          <Button size="lg" className="h-14 w-14 rounded-full shadow-[var(--shadow-glow-primary)] p-0"
            onClick={() => { setEditingDoc(null); setForm(emptyForm); setIsAdding(true); }}>
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>
      )}

      {/* Add/Edit Dialog */}
      {isMobile ? (
        <Drawer open={isAdding} onOpenChange={(v) => { if (!v) resetForm(); else setIsAdding(true); }}>
          <DrawerContent className="px-4 pb-6 max-h-[90vh] overflow-y-auto">
            <DrawerHeader className="text-left">
              <DrawerTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> {editingDoc ? "Edit Document" : "Add Document"}
              </DrawerTitle>
            </DrawerHeader>
            {formContent}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isAdding} onOpenChange={(v) => { if (!v) resetForm(); else setIsAdding(true); }}>
          <DialogContent className="sm:max-w-lg bg-card border-border/30 rounded-2xl shadow-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> {editingDoc ? "Edit Document" : "Add Document"}
              </DialogTitle>
            </DialogHeader>
            {formContent}
          </DialogContent>
        </Dialog>
      )}

      {/* View Document */}
      <Dialog open={!!viewingDoc} onOpenChange={(v) => { if (!v) setViewingDoc(null); }}>
        <DialogContent className="sm:max-w-lg bg-card border-border/30 rounded-2xl shadow-lg max-h-[85vh] overflow-y-auto p-0">
          {viewingDoc && (
            <>
              {/* Image header */}
              {viewingDoc.image_front_url && (
                <div className="h-52 overflow-hidden relative rounded-t-2xl">
                  <img src={viewingDoc.image_front_url} alt="Front" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5">
                    <h2 className="text-lg font-bold text-white">{viewingDoc.title}</h2>
                    <p className="text-xs text-white/70 mt-0.5">
                      {documentTypes.find((d) => d.value === viewingDoc.document_type)?.label}
                    </p>
                  </div>
                </div>
              )}

              <div className={cn("p-5 space-y-4", !viewingDoc.image_front_url && "pt-6")}>
                {!viewingDoc.image_front_url && (
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {React.createElement(getDocIcon(viewingDoc.document_type), { className: "h-4 w-4 text-primary" })}
                      {viewingDoc.title}
                    </DialogTitle>
                  </DialogHeader>
                )}

                {viewingDoc.image_back_url && (
                  <div>
                    <Label className="text-[10px] text-muted-foreground/50 mb-1.5 block font-medium uppercase tracking-wider">Back Side</Label>
                    <img src={viewingDoc.image_back_url} alt="Back" className="w-full rounded-xl border border-border/20" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Type", value: documentTypes.find((d) => d.value === viewingDoc.document_type)?.label },
                    { label: "Number", value: viewingDoc.document_number, mono: true },
                    { label: "Issuer", value: viewingDoc.issuer },
                    { label: "Expires", value: viewingDoc.expiry_date ? new Date(viewingDoc.expiry_date).toLocaleDateString() : null },
                    { label: "Issued", value: viewingDoc.issue_date ? new Date(viewingDoc.issue_date).toLocaleDateString() : null },
                  ].filter((f) => f.value).map((field) => (
                    <div key={field.label} className="p-3 bg-muted/20 rounded-xl border border-border/10">
                      <span className="text-[9px] text-muted-foreground/40 block font-medium uppercase tracking-wider">{field.label}</span>
                      <span className={cn("text-sm font-medium text-foreground mt-0.5 block", field.mono && "font-mono")}>{field.value}</span>
                    </div>
                  ))}
                </div>

                {viewingDoc.notes && (
                  <div className="p-3 bg-muted/20 rounded-xl border border-border/10">
                    <span className="text-[9px] text-muted-foreground/40 block mb-1 font-medium uppercase tracking-wider">Notes</span>
                    <p className="text-sm text-muted-foreground/60 whitespace-pre-wrap leading-relaxed">{viewingDoc.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1 rounded-xl h-10 gap-1.5" onClick={() => { setViewingDoc(null); handleEdit(viewingDoc); }}>
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button variant="destructive" className="rounded-xl h-10 px-4" onClick={() => { handleDelete(viewingDoc.id); setViewingDoc(null); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsPage;
