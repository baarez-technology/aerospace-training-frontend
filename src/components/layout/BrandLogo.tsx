import { cn } from '@/lib/utils';

/**
 * Glimmora Aero Space brand logo.
 *
 * - `full`  → the complete wordmark (G mark + "Aero Space Glimmora").
 * - `mark`  → just the circular "G" mark, cropped from the same asset so
 *             there is a single source of truth for the brand image.
 *
 * Uses a plain <img> on purpose: the public asset is a fixed raster and a
 * bare <img> is the most deployment-proof choice across Next versions.
 */
export function BrandLogo({
  variant = 'full',
  className,
  alt = 'Glimmora Aero Space',
}: {
  variant?: 'full' | 'mark';
  className?: string;
  alt?: string;
}) {
  if (variant === 'mark') {
    // The "G" occupies roughly the left quarter of the 1683×460 artwork.
    return (
      <span
        className={cn(
          'relative inline-flex aspect-square items-center justify-center overflow-hidden',
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/glimmora-logo.png"
          alt={alt}
          className="h-full w-auto max-w-none object-left"
          style={{ transform: 'scale(1.05)' }}
          draggable={false}
        />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/glimmora-logo.png"
      alt={alt}
      className={cn('h-auto w-auto select-none', className)}
      draggable={false}
    />
  );
}
