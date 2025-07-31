import { DebugSession } from "@/components/debug-session";

export default function DebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      <DebugSession />
    </div>
  );
}