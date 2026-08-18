import { Send } from 'lucide-react';

export default function CampaignsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-full bg-accentSoft flex items-center justify-center mb-6">
        <Send size={32} className="text-accent" />
      </div>
      <h2 className="text-2xl font-bold text-textMain mb-2">Campaigns</h2>
      <p className="text-textMuted max-w-md">
        Build and schedule multi-channel campaigns with WhatsApp templates,
        SMS blasts, and automated follow-ups. Coming soon.
      </p>
    </div>
  );
}
