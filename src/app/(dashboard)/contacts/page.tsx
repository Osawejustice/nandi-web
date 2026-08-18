import { Users } from 'lucide-react';

export default function ContactsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-full bg-brandSoft flex items-center justify-center mb-6">
        <Users size={32} className="text-brand" />
      </div>
      <h2 className="text-2xl font-bold text-textMain mb-2">Contacts</h2>
      <p className="text-textMuted max-w-md">
        Manage your customer contacts, view conversation history,
        and organize by tags and segments. Coming soon.
      </p>
    </div>
  );
}
