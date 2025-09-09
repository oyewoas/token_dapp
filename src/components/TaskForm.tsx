export function TaskForm({
  value,
  disabled = false,
  onChange,
  onSubmit,
  submitting,
}: {
  value: string;
  disabled: boolean;
  submitting: boolean;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto mb-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
     <input
  className="flex-1 px-4 py-3 border border-indigo-300 rounded-xl focus:outline-none focus:border-indigo-500 bg-indigo-50 text-base text-indigo-900 shadow-sm transition placeholder:text-indigo-400 disabled:bg-gray-100 disabled:text-gray-500"
  placeholder="New task description"
  value={value}
  onChange={(e) => onChange(e.target.value)}
  disabled={disabled}
  autoComplete="off"
/>

      <button
        type="submit"
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:scale-105 hover:bg-indigo-700 transition disabled:bg-indigo-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
      >
        {submitting ? "Adding…" : "Add Task"}
      </button>
    </form>
  );
}
