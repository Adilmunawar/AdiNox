
import { cn } from "@/lib/utils";
import React from "react";
import NoiseTexture from "./noise-texture";

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground = ({ className }: AnimatedBackgroundProps) => {
  return (
    <>
      <div className={cn("animated-gradient-background fixed inset-0 -z-10", className)} />
      <NoiseTexture />
    </>
  );
};

export default AnimatedBackground;
