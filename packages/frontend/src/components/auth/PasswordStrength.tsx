interface PasswordStrengthProps {
  password: string;
}

const requirements = [
  { label: 'At least 12 characters', test: (p: string) => p.length >= 12 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
  {
    label: 'Special character',
    test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
];

function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const metCount = requirements.filter((r) => r.test(password)).length;
  const strength =
    metCount <= 2 ? 'Weak' : metCount <= 4 ? 'Fair' : 'Strong';
  const strengthColor =
    metCount <= 2
      ? 'text-red-500'
      : metCount <= 4
        ? 'text-yellow-500'
        : 'text-green-500';

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < metCount
                ? metCount <= 2
                  ? 'bg-red-500'
                  : metCount <= 4
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                : 'bg-[var(--color-muted)]'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${strengthColor}`}>{strength}</p>
      <ul className="space-y-1">
        {requirements.map((req) => (
          <li
            key={req.label}
            className={`text-xs flex items-center gap-1 ${
              req.test(password)
                ? 'text-green-600'
                : 'text-[var(--color-muted-foreground)]'
            }`}
          >
            <span>{req.test(password) ? '\u2713' : '\u2717'}</span>
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export { PasswordStrength };
