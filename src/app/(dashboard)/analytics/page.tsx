import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-full bg-brandSoft flex items-center justify-center mb-6">
        <BarChart3 size={32} className="text-brand" />
      </div>
      <h2 className="text-2xl font-bold text-textMain mb-2">Analytics</h2>
      <p className="text-textMuted max-w-md">
        Real-time dashboards for call metrics, response times,
        agent performance, and customer sentiment trends. Coming soon.
      </p>
    </div>
  );
}
