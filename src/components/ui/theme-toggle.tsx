
import React from "react";
import { Button } from "@/components/ui/button";
import { Sun } from "lucide-react";

export const ThemeToggle = ({ className = "" }: { variant?: string; size?: string; className?: string }) => {
  return (
    <Button variant="outline" size="icon" className={`h-9 w-9 ${className}`} disabled aria-label="Light theme active">
      <Sun className="h-4 w-4 text-primary" />
    </Button>
  );
};

export default ThemeToggle;
