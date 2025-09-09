type Task = {
  id: bigint;
  description: string;
  completed: boolean;
};

export function TaskList({
  tasks,
  isLoading,
  canRead,
  onRefresh,
  onStartEdit,
  onSaveEdit,
  onChangeEdit,
  editingTaskId,
  editingTaskDesc,
  onComplete,
  txPending,
}: {
  tasks: Task[];
  isLoading: boolean;
  canRead: boolean;
  onRefresh: () => void;
  onStartEdit: (task: Task) => void;
  onSaveEdit: () => void;
  onChangeEdit: (v: string) => void;
  editingTaskId: bigint | null;
  editingTaskDesc: string;
  onComplete: (id: bigint) => void;
  txPending: boolean;
}) {
  return (
    <div className="mt-10 w-full max-w-3xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-indigo-900">Tasks ({tasks.length})</h2>
        <button
          onClick={onRefresh}
          disabled={!canRead || isLoading}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-5 py-2 rounded-2xl shadow-lg hover:scale-105 hover:shadow-xl transition-all disabled:from-indigo-300 disabled:to-purple-300 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Empty or Locked State */}
      {!canRead && (
        <p className="text-center text-gray-500 mb-6">Enter a contract address to begin.</p>
      )}
      {canRead && tasks.length === 0 && !isLoading && (
        <p className="text-center text-gray-500 mb-6">No tasks yet. Create one above.</p>
      )}

      {/* Task List */}
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li
            key={task.id.toString()}
            className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl shadow-md bg-white hover:shadow-xl transition-all ${
              task.completed ? "opacity-60" : ""
            }`}
          >
            {/* ID */}
            <span className="font-mono text-indigo-700 font-semibold min-w-[60px]">
              #{task.id.toString()}
            </span>

            {/* Description */}
            {editingTaskId === task.id ? (
              <input
                value={editingTaskDesc}
                onChange={(e) => onChangeEdit(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-indigo-300 text-indigo-900 bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm text-base"
              />
            ) : (
              <span
                className={`flex-1 text-base ${
                  task.completed ? "line-through text-gray-400" : "text-gray-900"
                }`}
              >
                {task.description}
              </span>
            )}

            {/* Status Badge */}
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                task.completed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {task.completed ? "Completed" : "Open"}
            </span>

            {/* Buttons */}
            <div className="flex gap-2 flex-wrap">
              {editingTaskId === task.id ? (
                <button
                  onClick={onSaveEdit}
                  disabled={txPending || !editingTaskDesc.trim()}
                  className="bg-indigo-600 text-white px-4 py-1 rounded-xl font-medium shadow hover:bg-indigo-700 transition-all disabled:bg-indigo-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => onStartEdit(task)}
                  disabled={txPending || task.completed}
                  className="bg-indigo-500 text-white px-4 py-1 rounded-xl font-medium shadow hover:bg-indigo-700 transition-all disabled:bg-indigo-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => onComplete(task.id)}
                disabled={txPending || task.completed}
                className="bg-green-600 text-white px-4 py-1 rounded-xl font-medium shadow hover:bg-green-700 transition-all disabled:bg-green-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Complete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
