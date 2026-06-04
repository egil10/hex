import { cn } from "@/lib/cn";

export function Swatch({
  hex,
  className,
  style,
  children,
  title,
  onClick,
  selected,
}: {
  hex: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  title?: string;
  onClick?: () => void;
  selected?: boolean;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      title={title}
      onClick={onClick}
      style={{ backgroundColor: hex, ...style }}
      className={cn(
        "relative overflow-hidden rounded-xl border",
        selected ? "border-accent ring-2 ring-accent/50" : "border-border",
        onClick && "cursor-pointer transition-transform hover:scale-[1.015] active:scale-[0.99]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
