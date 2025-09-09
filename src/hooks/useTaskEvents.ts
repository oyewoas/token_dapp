import { useEffect, useRef, useCallback } from "react";
import { useAppState } from "../store/context";
import { useTaskRead } from "./useTaskRead";
import { decodeEventLog, type Hash } from "viem";

export function useTaskEvents() {
  const { state, dispatch, abi } = useAppState();
  const { contractAddress, publicClient } = state;
  const { loadTasks } = useTaskRead();
  const EventSwitch = useCallback(
    (eventName: string, args: Record<string, unknown> | undefined) => {
      switch (eventName) {
        case "TaskCreated": {
          dispatch({
            type: "NOTICE",
            text: (args?.description as string) || "Task Created",
          });
          dispatch({
            type: "LOG",
            text: (args?.description as string) || "Event TaskCreated",
            hash: args?.hash as Hash,
          });
          break;
        }
        case "TaskUpdated": {
          const id = args?.id as number;
          const desc = args?.description as string;
          dispatch({
            type: "NOTICE",
            text: `Task #${id} updated${desc ? `: ${desc}` : ""}`,
          });
          dispatch({
            type: "LOG",
            text: `Event TaskUpdated: #${id}${desc ? ` -> ${desc}` : ""}`,
            hash: args?.hash as Hash,
          });
          break;
        }
        case "TaskCompleted": {
          const id = args?.id as number;
          dispatch({
            type: "NOTICE",
            text: `Task #${id} completed`,
          });
          dispatch({
            type: "LOG",
            text: `Event TaskCompleted: #${id}`,
            hash: args?.hash as Hash,
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
    if (!publicClient || !contractAddress) return;

    // If you need to fetch logs, use an async IIFE
    // fetch past logs once

    const unwatch = publicClient.watchContractEvent({
      address: contractAddress,
      abi,
      onLogs: (logs) => {
        for (const log of logs) {
          const { eventName, args } = decodeEventLog({
            abi,
            data: log.data,
            topics: log.topics,
          });
          if (!eventName) continue;
          EventSwitch(eventName, args as Record<string, unknown> | undefined);
        }

        // 🔹 schedule one refresh for all events
        scheduleRefresh();
      },
    });

    return () => {
      unwatch?.();
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [
    publicClient,
    contractAddress,
    scheduleRefresh,
    abi,
    dispatch,
    EventSwitch,
  ]);
}
