export function Notices({
  notices,
}: {
  notices: Array<{ text: string }>;
}) {
  if (!notices.length) return null;
  return (
    <div className="fixed top-6 right-6 flex flex-col gap-4 z-50">
      {notices.map((n, i) => (
        <div
          key={i}
          className="bg-gradient-to-r from-indigo-700 via-indigo-900 to-purple-800 text-white px-6 py-3 rounded-xl shadow-2xl animate-fade-in-out"
        >
          <span className="font-semibold tracking-wide">{n.text}</span>
        </div>
      ))}

      <style>{`
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(-10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
