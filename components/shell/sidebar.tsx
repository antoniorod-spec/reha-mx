import { Shield } from 'lucide-react';

import { BranchSelector, type BranchOption } from './branch-selector';
import { Logo } from './logo';
import { SidebarNav } from './sidebar-nav';

interface SidebarProps {
  branches: BranchOption[];
  activeBranchSlug: string | null;
  organizationName: string;
}

/**
 * Sidebar fijo desktop (244px). Layout:
 *   1. Logo + tagline (4px padding-x)
 *   2. Branch selector (12px padding-x)
 *   3. Etiqueta "Workspace" en mono
 *   4. Nav items (scroll si overflow)
 *   5. Footer: badge NOM-024 cumplido
 *
 * Mobile: este componente se renderiza dentro de un drawer (ver shell-mobile).
 * Server component — el branch-selector y nav son client islands.
 */
export function Sidebar({ branches, activeBranchSlug, organizationName }: SidebarProps) {
  return (
    <aside className="border-border bg-surface sticky top-0 hidden h-screen w-[244px] shrink-0 flex-col border-r md:flex">
      <div className="px-4 pt-5 pb-3">
        <Logo />
      </div>
      <div className="px-3 pb-3">
        <BranchSelector branches={branches} activeSlug={activeBranchSlug} />
      </div>
      <div className="text-subtle px-4 pt-2 pb-1.5 font-mono text-[10px] tracking-wider uppercase">
        Workspace
      </div>
      <SidebarNav />
      <div className="border-border border-t px-3 pt-3 pb-4">
        <div className="border-border bg-surface-2 rounded-lg border p-2.5">
          <div className="flex items-center gap-2">
            <Shield className="text-good size-[14px]" aria-hidden />
            <span className="text-text text-[11px] font-medium tracking-[-0.011em]">
              NOM-004-SSA3 + LFPDPPP
            </span>
          </div>
          <div className="text-subtle mt-1 font-mono text-[10px]">{organizationName}</div>
        </div>
      </div>
    </aside>
  );
}
