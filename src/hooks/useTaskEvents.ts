// src/hooks/useTaskEvents.ts
import { useEffect, useRef, useCallback } from "react";
import { Contract } from "ethers";
import { useAppState } from "../store/context";
import { useTaskRead } from "./useTaskRead";
import type { EventLog } from "ethers";

export function useTaskEvents() {
  const { state, dispatch, abi } = useAppState();
  const { contractAddress, provider, signer } = state;
  const { loadTasks } = useTaskRead();

  const EventSwitch = useCallback(
    (eventName: string, args?: Record<string, unknown>) => {
      switch (eventName) {
        case "TaskCreated": {
          dispatch({
            type: "NOTICE",
            text: (args?.description as string) || "Task Created",
          });
          dispatch({
            type: "LOG",
            text: (args?.description as string) || "Event TaskCreated",
            hash: args?.hash as string,
          });
          break;
        }
        case "TaskUpdated": {
          const id = args?.id as bigint;
          const desc = args?.description as string;
          dispatch({
            type: "NOTICE",
            text: `Task #${id} updated${desc ? `: ${desc}` : ""}`,
          });
          dispatch({
            type: "LOG",
            text: `Event TaskUpdated: #${id}${desc ? ` -> ${desc}` : ""}`,
            hash: args?.hash as string,
          });
          break;
        }
        case "TaskCompleted": {
          const id = args?.id as bigint;
          dispatch({
            type: "NOTICE",
            text: `Task #${id} completed`,
          });
          dispatch({
            type: "LOG",
            text: `Event TaskCompleted: #${id}`,
            hash: args?.hash as string,
          });
          break;
        }
      }
    },
    [dispatch]
  );

  // 🔹 debounce task refresh
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => {
      loadTasks();
      refreshTimer.current = null;
    }, 300); // batch events within 300ms
  }, [loadTasks]);

  useEffect(() => {
    if (!provider || !contractAddress) return;

    // use signer if available, otherwise readonly provider
    const runner = signer ?? provider;
    const contract = new Contract(contractAddress, abi, runner);

    // attach listeners
    const handleTaskCreated = (id: bigint, description: string, event: EventLog) => {
      EventSwitch("TaskCreated", { id, description, hash: event?.transactionHash });
      scheduleRefresh();
    };


    const handleTaskUpdated = (id: bigint, description: string, event: EventLog) => {
      EventSwitch("TaskUpdated", { id, description, hash: event?.transactionHash });
      scheduleRefresh();
    };

    const handleTaskCompleted = (id: bigint, event: EventLog) => {
      EventSwitch("TaskCompleted", { id, hash: event?.transactionHash });
      scheduleRefresh();
    };

    contract.on("TaskCreated", handleTaskCreated);
    contract.on("TaskUpdated", handleTaskUpdated);
    contract.on("TaskCompleted", handleTaskCompleted);

    return () => {
      contract.removeAllListeners();
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [provider, signer, contractAddress, abi, EventSwitch, scheduleRefresh]);
}
