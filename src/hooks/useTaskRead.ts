// src/hooks/useTaskRead.ts
import { useCallback } from "react";
import { useAppState } from "../store/context";
import { getErrorMessage } from "../utils/errors";
import type { Task } from "../types";

export function useTaskRead() {
  const { state, dispatch, abi } = useAppState();
  const { contractAddress, publicClient } = state;
    
  const loadTasks = useCallback(async () => {
    if (!contractAddress || !publicClient) return;
    dispatch({ type: "SET_LOADING", isLoading: true });
    dispatch({ type: "ERROR", error: "" });

    try {
      const list = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: "getTasks",
      });
      dispatch({ type: "SET_TASKS", tasks: list as unknown as Task[] });
    } catch (e) {
      const msg = getErrorMessage(e);
      dispatch({ type: "ERROR", error: msg });
    } finally {
      dispatch({ type: "SET_LOADING", isLoading: false });
    }
  }, [contractAddress, publicClient, abi, dispatch]);
  return { loadTasks, tasks: state.tasks, isLoading: state.isLoading };
}
