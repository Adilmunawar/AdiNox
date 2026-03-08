import React from "react";
import { NavLink as RouterNavLink, NavLinkProps as RouterNavLinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps extends RouterNavLinkProps {
  activeClassName?: string;
}

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        className={({ isActive }) =>
          cn(className, isActive && activeClassName)
        }
        {...props}
      />
    );
  }
);

NavLink.displayName = "NavLink";
export default NavLink;
