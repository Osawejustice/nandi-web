import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-full bg-soft flex items-center justify-center mb-6">
        <SettingsIcon size={32} className="text-textMuted" />
      </div>
      <h2 className="text-2xl font-bold text-textMain mb-2">Settings</h2>
      <p className="text-textMuted max-w-md">
        Manage your workspace, team roles, channel integrations,
        and notification preferences. Coming soon.
      </p>
    </div>
  );
}
