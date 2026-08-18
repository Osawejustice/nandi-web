export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textMain">Help</h1>
        <p className="text-sm text-textMuted mt-1">
          Nandi is an Africa-first customer engagement workspace for SMS and WhatsApp.
        </p>
      </div>

      <section className="bg-surface border border-border rounded-xl p-6 space-y-3">
        <h2 className="font-semibold text-textMain">Agent inbox</h2>
        <ul className="text-sm text-textMuted space-y-2 list-disc pl-5">
          <li>Search and filter conversations by status, channel, or assignee.</li>
          <li>Open a thread to reply. Enter sends, Shift+Enter adds a new line.</li>
          <li>Change status or assignment from the contact sidebar.</li>
          <li>New inbound messages appear without refreshing when the live connection is active.</li>
        </ul>
      </section>

      <section className="bg-surface border border-border rounded-xl p-6 space-y-3">
        <h2 className="font-semibold text-textMain">Campaigns</h2>
        <p className="text-sm text-textMuted">
          Create a draft, optionally target a contact tag, then start the campaign. The backend worker sends the
          messages. Cancellation is not available in this API version.
        </p>
      </section>

      <section className="bg-surface border border-border rounded-xl p-6 space-y-3">
        <h2 className="font-semibold text-textMain">Documentation</h2>
        <p className="text-sm text-textMuted">
          Product documentation will live here. For API details, use the backend Swagger UI at
          {' '}<code className="text-xs bg-soft px-1.5 py-0.5 rounded">/swagger/index.html</code>.
        </p>
      </section>
    </div>
  );
}
