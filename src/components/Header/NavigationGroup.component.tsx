'use client';

import { mobileNavigation } from './Header.styles';
import type { NavigationGroupProps } from './Header.types';
import { MobileNavLink } from './MobileNavLink.component';

export function NavigationGroup({ item }: NavigationGroupProps) {
  if (!item.children) {
    if (!item.href) return null;
    return (
      <MobileNavLink href={item.href} className={mobileNavigation.topLevelLink}>
        {item.title}
      </MobileNavLink>
    );
  }

  return (
    <div className={mobileNavigation.group}>
      <span className={mobileNavigation.groupTitle}>{item.title}</span>
      {item.children.map((c, j) => (
        <MobileNavLink key={j} href={c.href}>
          {c.title}
        </MobileNavLink>
      ))}
    </div>
  );
}
