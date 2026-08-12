export function Settings() {
  return (
    <div className="rounded-xl p-6 bg-white border border-border max-w-xl">
      <h3 className="text-sm font-semibold mb-1">API Connection</h3>
      <p className="text-xs text-sub mb-4">
        RideFlow reads its API base URL from <code className="font-mono">VITE_API_BASE_URL</code>, and the server
        reads its MongoDB connection from <code className="font-mono">MONGODB_URI</code> / <code className="font-mono">MONGODB_DATABASE</code>.
        Update the respective <code className="font-mono">.env</code> files to point at a different environment.
      </p>
      <div className="text-xs text-sub">More workspace preferences will live here as the product grows.</div>
    </div>
  );
}
