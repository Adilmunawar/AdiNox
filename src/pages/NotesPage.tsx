import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Plus, StickyNote, Pin, PinOff, Lock, Unlock, Trash2, MoreVertical, Search, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type VaultNote = {
  id: string;
  title: string;
  content: string | null;
  color: string | null;
  is_pinned: boolean;
  is_locked: boolean;
  category: string | null;
  created_at: string;
  updated_at: string;
};

const noteColors: Record<string, { bg: string; border: string; dot: string }> = {
  default: { bg: "bg-card/60", border: "border-border/30", dot: "bg-muted-foreground/30" },
  purple: { bg: "bg-purple-500/[0.06]", border: "border-purple-500/15", dot: "bg-purple-500" },
  blue: { bg: "bg-blue-500/[0.06]", border: "border-blue-500/15", dot: "bg-blue-500" },
  green: { bg: "bg-emerald-500/[0.06]", border: "border-emerald-500/15", dot: "bg-emerald-500" },
  yellow: { bg: "bg-amber-500/[0.06]", border: "border-amber-500/15", dot: "bg-amber-500" },
  red: { bg: "bg-red-500/[0.06]", border: "border-red-500/15", dot: "bg-red-500" },
  pink: { bg: "bg-pink-500/[0.06]", border: "border-pink-500/15", dot: "bg-pink-500" },
};

const stagger = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] } }),
};

const NoteCard = React.memo(({ note, onDelete, onTogglePin, onEdit }: {
  note: VaultNote; onDelete: (id: string) => void; onTogglePin: (note: VaultNote) => void; onEdit: (note: VaultNote) => void;
}) => {
  const colors = noteColors[note.color || "default"] || noteColors.default;

  return (
    <Card className={cn("p-4 backdrop-blur-sm hover-lift transition-all cursor-pointer group", colors.bg, colors.border)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={cn("h-2 w-2 rounded-full shrink-0", colors.dot)} />
          <h3 className="text-sm font-semibold text-foreground truncate">{note.title}</h3>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {note.is_pinned && <Pin className="h-3 w-3 text-primary/60" />}
          {note.is_locked && <Lock className="h-3 w-3 text-amber-500/60" />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(note)} className="text-xs cursor-pointer">
                <Edit className="h-3 w-3 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTogglePin(note)} className="text-xs cursor-pointer">
                {note.is_pinned ? <><PinOff className="h-3 w-3 mr-2" /> Unpin</> : <><Pin className="h-3 w-3 mr-2" /> Pin</>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(note.id)} className="text-destructive text-xs cursor-pointer">
                <Trash2 className="h-3 w-3 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {note.is_locked ? (
        <div className="flex items-center gap-2 py-4 justify-center text-muted-foreground/40">
          <Lock className="h-4 w-4" />
          <span className="text-xs">Locked</span>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/60 line-clamp-4 whitespace-pre-wrap leading-relaxed">
          {note.content || "No content"}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <p className="text-[9px] text-muted-foreground/30">
          {new Date(note.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
        {note.category && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/40 border border-border/20 text-muted-foreground/50">{note.category}</span>
        )}
      </div>
    </Card>
  );
});
NoteCard.displayName = "NoteCard";

const NotesPage = () => {
  const [notes, setNotes] = useState<VaultNote[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingNote, setEditingNote] = useState<VaultNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [form, setForm] = useState({ title: "", content: "", color: "default", category: "", is_locked: false });

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from("vault_notes").select("*").order("is_pinned", { ascending: false }).order("updated_at", { ascending: false });
    if (error) toast({ title: "Error", description: "Failed to load notes.", variant: "destructive" });
    else setNotes((data || []) as VaultNote[]);
    setLoading(false);
  }, [user, toast]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleSave = async () => {
    if (!user || !form.title) return;

    if (editingNote) {
      const { error } = await supabase.from("vault_notes").update({
        title: form.title, content: form.content || null, color: form.color,
        category: form.category || null, is_locked: form.is_locked, updated_at: new Date().toISOString(),
      }).eq("id", editingNote.id);
      if (error) { toast({ title: "Error", description: "Failed to update.", variant: "destructive" }); return; }
      toast({ title: "Updated", description: "Note updated successfully." });
    } else {
      const { error } = await supabase.from("vault_notes").insert({
        user_id: user.id, title: form.title, content: form.content || null,
        color: form.color, category: form.category || null, is_locked: form.is_locked,
      });
      if (error) { toast({ title: "Error", description: "Failed to save note.", variant: "destructive" }); return; }
      toast({ title: "Note saved", description: "Your note has been added." });
    }

    resetForm();
    fetchNotes();
  };

  const resetForm = () => {
    setForm({ title: "", content: "", color: "default", category: "", is_locked: false });
    setIsAdding(false);
    setEditingNote(null);
  };

  const handleEdit = (note: VaultNote) => {
    setEditingNote(note);
    setForm({ title: note.title, content: note.content || "", color: note.color || "default", category: note.category || "", is_locked: note.is_locked });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    const { error } = await supabase.from("vault_notes").delete().eq("id", id);
    if (error) { toast({ title: "Error", variant: "destructive" }); return; }
    setNotes(notes.filter(n => n.id !== id));
    toast({ title: "Deleted", description: "Note removed." });
  };

  const handleTogglePin = async (note: VaultNote) => {
    const { error } = await supabase.from("vault_notes").update({ is_pinned: !note.is_pinned }).eq("id", note.id);
    if (error) { toast({ title: "Error", variant: "destructive" }); return; }
    fetchNotes();
  };

  const filtered = notes.filter(n => {
    const t = search.toLowerCase();
    return n.title.toLowerCase().includes(t) || (n.content || "").toLowerCase().includes(t);
  });

  const colorOptions = Object.keys(noteColors);
  const inputCls = "h-10 bg-secondary/30 border-border/40 rounded-lg text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/15";

  const formContent = (
    <div className="space-y-4 py-2">
      <div><Label className="text-[11px] text-muted-foreground mb-1 block">Title</Label>
        <Input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Note title" required />
      </div>
      <div><Label className="text-[11px] text-muted-foreground mb-1 block">Content</Label>
        <Textarea
          className="bg-secondary/30 border-border/40 rounded-lg text-sm min-h-[120px] focus:border-primary/50 focus:ring-1 focus:ring-primary/15 resize-none"
          value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write your note..."
        />
      </div>
      <div><Label className="text-[11px] text-muted-foreground mb-1 block">Color</Label>
        <div className="flex gap-2 flex-wrap">
          {colorOptions.map(c => (
            <button
              key={c}
              onClick={() => setForm(f => ({ ...f, color: c }))}
              className={cn(
                "h-7 w-7 rounded-lg border-2 transition-all",
                noteColors[c].dot === "bg-muted-foreground/30" ? "bg-secondary/60" : "",
                form.color === c ? "border-primary scale-110 shadow-md" : "border-transparent hover:scale-105"
              )}
            >
              <div className={cn("h-full w-full rounded-md", noteColors[c].dot)} />
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-[11px] text-muted-foreground mb-1 block">Category</Label>
          <Input className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Personal" />
        </div>
        <div className="flex items-end gap-2 pb-0.5">
          <Label className="text-[11px] text-muted-foreground flex items-center gap-2">
            <Lock className="h-3 w-3" /> Locked
          </Label>
          <Switch checked={form.is_locked} onCheckedChange={v => setForm(f => ({ ...f, is_locked: v }))} className="scale-75" />
        </div>
      </div>
      <Button onClick={handleSave} className="w-full h-11 rounded-xl btn-premium" disabled={!form.title}>
        <Plus className="h-4 w-4 mr-1.5" /> {editingNote ? "Update Note" : "Save Note"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Secure Notes</h1>
            <p className="text-sm text-muted-foreground/60 mt-1">Keep your sensitive notes safe and organized.</p>
          </div>
          {!isMobile && (
            <Button onClick={() => { setEditingNote(null); setForm({ title: "", content: "", color: "default", category: "", is_locked: false }); setIsAdding(true); }} className="rounded-xl gap-2 btn-premium">
              <Plus className="h-4 w-4" /> Add Note
            </Button>
          )}
        </div>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search notes..." className="pl-9 bg-card/40 border-border/40 rounded-xl" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-xl bg-card/40 animate-pulse border border-border/20 break-inside-avoid" />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-card/30 rounded-xl border border-dashed border-border/40">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <StickyNote className="h-7 w-7 text-primary/50" />
          </div>
          <p className="text-lg font-medium">{search ? "No notes found" : "No notes yet"}</p>
          <p className="text-sm text-muted-foreground/60 mt-1 mb-4">{search ? "Try a different search." : "Create your first secure note."}</p>
          {!search && <Button onClick={() => setIsAdding(true)} className="rounded-xl btn-premium"><Plus className="h-4 w-4 mr-1.5" /> Add Note</Button>}
        </motion.div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.map((note, i) => (
            <motion.div key={note.id} custom={i} variants={stagger} initial="hidden" animate="visible" className="break-inside-avoid">
              <NoteCard note={note} onDelete={handleDelete} onTogglePin={handleTogglePin} onEdit={handleEdit} />
            </motion.div>
          ))}
        </div>
      )}

      {isMobile && (
        <motion.div className="fixed bottom-20 right-4 z-50" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
          <Button size="lg" className="h-14 w-14 rounded-full shadow-lg shadow-primary/25 p-0" onClick={() => { setEditingNote(null); setForm({ title: "", content: "", color: "default", category: "", is_locked: false }); setIsAdding(true); }}>
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>
      )}

      {isMobile ? (
        <Drawer open={isAdding} onOpenChange={(v) => { if (!v) resetForm(); else setIsAdding(true); }}>
          <DrawerContent className="px-4 pb-6 max-h-[90vh] overflow-y-auto">
            <DrawerHeader className="text-left"><DrawerTitle className="flex items-center gap-2"><StickyNote className="h-4 w-4 text-primary" /> {editingNote ? "Edit Note" : "Add Note"}</DrawerTitle></DrawerHeader>
            {formContent}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isAdding} onOpenChange={(v) => { if (!v) resetForm(); else setIsAdding(true); }}>
          <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/30 rounded-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><StickyNote className="h-4 w-4 text-primary" /> {editingNote ? "Edit Note" : "Add Note"}</DialogTitle></DialogHeader>
            {formContent}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Import Switch here since it's used in the form
import { Switch } from "@/components/ui/switch";

export default NotesPage;
