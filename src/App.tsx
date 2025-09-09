// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
} from "viem";
import { WalletBar } from "./components/WalletBar";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { Notices } from "./components/Notices";
import { ActivityLog } from "./components/ActivityLog";
import { useAppState } from "./store/context";
import { getErrorMessage } from "./utils/errors";
import { getChainLabel, getExplorerBase } from "./utils/chain";
import { useTaskEvents } from "./hooks/useTaskEvents";
import type { Task } from "./types";
import { useTaskRead } from "./hooks/useTaskRead";
import { useTaskWrite } from "./hooks/useTaskWrite";

function App() {
  const { state, dispatch } = useAppState();
  const {
    contractAddress,
    walletClient,
    publicClient,
    account,
    chainId,
    ethClient,
  } = state;

  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<bigint | null>(null);
  const [editingTaskDesc, setEditingTaskDesc] = useState("");

  const chain = useMemo(
    () =>
      chainId
        ? defineChain({
            id: chainId,
            name: `Chain ${chainId}`,
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: { default: { http: [] }, public: { http: [] } },
          })
        : undefined,
    [chainId]
  );

  const canRead = Boolean(contractAddress && publicClient);
  const canWrite = Boolean(
    contractAddress && publicClient && walletClient && account
  );

  // Hooks
  const { loadTasks } = useTaskRead();
  useTaskEvents();
  const { createTask, updateTask, completeTask } = useTaskWrite();

  // Wallet Actions
  async function connectWallet() {
    const eth = window.ethereum;
    if (!eth) return;
    try {
      const wallet = createWalletClient({ transport: custom(eth) });
      const pub = createPublicClient({ transport: custom(eth) });
      const id = await wallet.getChainId();
      const [addr] = await wallet.requestAddresses();
      dispatch({
        type: "SET_CLIENTS",
        publicClient: pub,
        walletClient: wallet,
        ethClient: eth,
        chainId: id,
        account: addr ?? null,
      });
      dispatch({
        type: "NOTICE",
        text: `Wallet connected: ${addr.slice(0, 6)}…${addr.slice(-4)}`,
      });
    } catch (e) {
      dispatch({ type: "ERROR", error: getErrorMessage(e) });
    }
  }

  async function disconnectWallet() {
    if (!ethClient) return;

    try {
      await ethClient.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
      dispatch({ type: "SET_CLIENTS", publicClient: null, walletClient: null, ethClient: null, chainId: null, account: null });

    } catch (e) {
      dispatch({ type: "ERROR", error: getErrorMessage(e) });
    }
  }

  // Task Actions
  async function onCreateTask() {
    if (!canWrite || !walletClient || !contractAddress || !newTaskDesc.trim())
      return;
    await createTask(newTaskDesc, () => {
      setNewTaskDesc("");
      loadTasks();
    });
  }

  async function onSaveEdit() {
    if (
      !canWrite ||
      !walletClient ||
      !contractAddress ||
      editingTaskId === null ||
      !editingTaskDesc.trim()
    )
      return;
    await updateTask(editingTaskId, editingTaskDesc, () => {
      setEditingTaskId(null);
      setEditingTaskDesc("");
      loadTasks();
    });
  }

  async function onCompleteTask(id: bigint) {
    if (!canWrite || !walletClient || !contractAddress) return;
    await completeTask(id, () => {
      loadTasks();
    });
  }

  // Initial load
  useEffect(() => {
    if (canRead) {
      loadTasks();
    } else {
      dispatch({ type: "SET_TASKS", tasks: [] });
    }
  }, [canRead, loadTasks, dispatch]);

  const chainLabel = getChainLabel(chainId, chain);
  const explorerBase = getExplorerBase(chainId);
  return (
  <div className="min-h-screen w-full bg-gray-50 px-4 py-10 flex flex-col items-center">
    {/* Header */}
    <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-900 text-center mb-6">
      Task dApp
    </h1>

    {/* Wallet Bar under header */}
    <div className="w-full max-w-4xl mb-6">
        <WalletBar
          account={account}
          chain={chain}
          chainLabel={chainLabel}
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
        />
    </div>

    {/* Notices */}
    <Notices notices={state.notices} />

    {/* Main Grid */}
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Column: TaskForm + TaskList */}
      <div className="lg:col-span-2 flex flex-col gap-6 w-full">
        <TaskForm
          value={newTaskDesc}
          onChange={setNewTaskDesc}
          onSubmit={onCreateTask}
          disabled={!canWrite || state.txPending}
          submitting={state.txPending}
        />

        <TaskList
          tasks={state.tasks}
          isLoading={state.isLoading}
          canRead={canRead}
          onRefresh={loadTasks}
          onStartEdit={(task: Task) => {
            setEditingTaskId(task.id);
            setEditingTaskDesc(task.description);
          }}
          onSaveEdit={onSaveEdit}
          onChangeEdit={setEditingTaskDesc}
          editingTaskId={editingTaskId}
          editingTaskDesc={editingTaskDesc}
          onComplete={onCompleteTask}
          txPending={state.txPending}
        />
      </div>

      {/* Right Column: ActivityLog */}
      <div className="flex flex-col gap-6 w-full">
        <div className="w-full bg-white rounded-2xl shadow-lg p-5">
          <ActivityLog logs={state.logs} explorerBase={explorerBase} />
        </div>
      </div>
    </div>
  </div>
);

}

export default App;
