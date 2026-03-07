export interface NavigationChild {
  title: string;
  href: string;
}

export interface NavigationItem {
  title: string;
  href?: string;
  children?: NavigationChild[];
}

export interface EnvironmentItem {
  name: string;
  href: string;
}

export interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export interface MobileNavIconProps {
  open: boolean;
}

export interface DesktopNavItemProps {
  item: NavigationItem;
  index: number;
  popoverOpen: number | null;
  setPopoverOpen: (i: number | null) => void;
}

export interface NavigationGroupProps {
  item: NavigationItem;
}

export interface EnvironmentLinkProps {
  name: string;
  href: string;
  children: React.ReactNode;
}
