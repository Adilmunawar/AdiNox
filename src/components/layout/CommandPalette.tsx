import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { LayoutDashboard, Shield, Settings, LogOut, Plus, Search } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommandPalette = React.memo(({ open, onOpenChange }: CommandPaletteProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const runAction = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runAction(() => navigate("/"))}>
            <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => runAction(() => navigate("/tokens"))}>
            <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
            2FA Tokens
          </CommandItem>
          <CommandItem onSelect={() => runAction(() => navigate("/settings"))}>
            <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
            Settings
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runAction(() => navigate("/tokens"))}>
            <Plus className="mr-2 h-4 w-4 text-muted-foreground" />
            Add New Token
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Account">
          <CommandItem onSelect={() => runAction(signOut)} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
});

CommandPalette.displayName = "CommandPalette";
export default CommandPalette;
