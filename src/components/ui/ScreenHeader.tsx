/**
 * Pixel-font screen title plus optional subtitle. Carries the mood of the
 * design's device title bar without the desktop window chrome.
 */
export function ScreenHeader({
  title,
  subtitle,
  titleSize = 22,
}: {
  title: string;
  subtitle?: string;
  titleSize?: number;
}) {
  return (
    <div className="w-full">
      <h1
        className="font-display text-[var(--text-primary)] leading-[1.25]"
        style={{ fontSize: titleSize }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="font-body text-[13px] text-[var(--text-secondary)] mt-1">{subtitle}</p>
      )}
    </div>
  );
}
