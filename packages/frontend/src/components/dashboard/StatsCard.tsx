interface StatsCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
}

export function StatsCard({ label, value, sublabel }: StatsCardProps) {
  return (
    <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-5 shadow-sm">
      <p className="text-sm text-[var(--color-muted-foreground)] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[var(--color-foreground)]">{value}</p>
      {sublabel && (
        <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{sublabel}</p>
      )}
    </div>
  );
}
