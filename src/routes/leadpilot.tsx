import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/leadpilot")({
  head: () => ({
    meta: [
      { title: "LeadPilot" },
      { name: "description", content: "LeadPilot workspace." },
    ],
  }),
  component: LeadPilotPage,
});

function LeadPilotPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">LeadPilot</h1>
        <p className="text-sm text-neutral-400">
          এই tool-এর সব কিছু মুছে ফেলা হয়েছে। শুধু page-টি রাখা আছে।
        </p>
      </div>
    </main>
  );
}
