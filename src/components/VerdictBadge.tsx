import { getVeredictoLabel } from '@/lib/format';
import type { Veredicto } from '@/lib/types';
import { CheckIcon, ShieldIcon, WarningIcon } from './Icons';

interface VerdictBadgeProps {
  veredicto: Veredicto;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Insignia de veredicto conforme a §10.1 y AC-A11Y-03.
 * Siempre incluye el texto y el icono representativo (no solo color).
 */
export function VerdictBadge({ veredicto, size = 'md', className = '' }: VerdictBadgeProps) {
  const label = getVeredictoLabel(veredicto);

  let IconComponent = CheckIcon;
  let modifierClass = 'verdict-badge--clean';

  if (veredicto === 'malicioso') {
    IconComponent = ShieldIcon;
    modifierClass = 'verdict-badge--malicious';
  } else if (veredicto === 'sospechoso') {
    IconComponent = WarningIcon;
    modifierClass = 'verdict-badge--suspicious';
  }

  const iconSize = size === 'lg' ? 22 : size === 'sm' ? 14 : 16;

  return (
    <span
      className={`verdict-badge ${modifierClass} verdict-badge--${size} ${className}`.trim()}
      data-veredicto={veredicto}
    >
      <IconComponent size={iconSize} className="verdict-badge__icon" />
      <span className="verdict-badge__label">{label}</span>
    </span>
  );
}
