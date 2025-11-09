import { FC } from "react";
import { cn } from "@/lib/utils";

interface SvgIconProps {
  src: string;
  className?: string;
}

export const SvgIcon: FC<SvgIconProps> = ({ src, className }) => {
  return (
    <img 
      src={src} 
      alt="" 
      className={cn("h-6 w-6", className)}
      style={{ display: "inline-block" }}
    />
  );
};

