import type { Hash } from "viem";

export function ActivityLog({
  logs,
  explorerBase,
}: {
  logs: Array<{ text: string; hash?: Hash }>;
  explorerBase?: string;
}) {
  return (
    <div className="mt-8 w-full max-w-xl mx-auto">
      <h3 className="text-lg font-bold mb-4 text-indigo-900">Activity Log</h3>
      <div className="max-h-60 md:max-h-150 overflow-auto border border-indigo-200 rounded-xl p-4 bg-gradient-to-br from-indigo-50 to-white shadow-lg">
        {logs.length === 0 ? (
          <div className="opacity-70 text-sm text-center py-6">
            No activity yet.
          </div>
        ) : (
          <ul className="list-none flex flex-col gap-2">
            {logs.map((l, i) => {
              const href =
                l.hash && explorerBase ? `${explorerBase}/tx/${l.hash}` : "";
              return (
                <li
                  key={i}
                  className="font-mono text-black text-xs bg-white rounded-lg px-3 py-2 shadow-sm flex items-center justify-between hover:bg-indigo-50 transition"
                >
                  <span>{l.text}</span>
                  {href && (
                    <a
                      className="text-indigo-600 underline ml-2 hover:text-indigo-800 transition"
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      view tx
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
