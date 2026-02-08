import { useAuthStore } from '@stores/authStore';
import { useUpdateProfile } from '@hooks/useProfile';
import type { UserSettings } from 'shared/types';

function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const updateProfile = useUpdateProfile();

  const settings = profile?.settings;
  const theme = settings?.theme ?? 'system';
  const defaultRefineEnabled = settings?.default_refine_enabled ?? true;

  function handleThemeChange(newTheme: UserSettings['theme']) {
    updateProfile.mutate({ settings: { theme: newTheme } });
  }

  function handleRefineToggle() {
    updateProfile.mutate({
      settings: { default_refine_enabled: !defaultRefineEnabled },
    });
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Settings</h1>

      {/* Account */}
      <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Account</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--color-muted-foreground)]">Email</p>
            <p className="font-medium">{user?.email ?? '--'}</p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Appearance</h2>
        <div>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-3">Theme</p>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleThemeChange(t)}
                className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                  theme === t
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]'
                    : 'border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Preferences</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={defaultRefineEnabled}
            onChange={handleRefineToggle}
            className="w-4 h-4 accent-[var(--color-primary)]"
          />
          <div>
            <p className="font-medium text-sm">Enable AI refinement by default</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              When enabled, new entries will be offered AI conversation and refinement.
            </p>
          </div>
        </label>
      </div>

      {updateProfile.isPending && (
        <p className="text-sm text-[var(--color-muted-foreground)]">Saving...</p>
      )}
    </div>
  );
}

export default SettingsPage;
