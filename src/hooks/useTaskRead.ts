// src/hooks/useTaskRead.ts
import { useCallback } from "react";
import { Contract } from "ethers";
import { useAppState } from "../store/context";
import { getErrorMessage } from "../utils/errors";
import type { Task } from "../types";

export function useTaskRead() {
  const { state, dispatch, abi } = useAppState();
  const { contractAddress, provider, signer } = state;

  const loadTasks = useCallback(async () => {
    if (!contractAddress || !provider) return;
    dispatch({ type: "SET_LOADING", isLoading: true });
    dispatch({ type: "ERROR", error: "" });

    try {
      // use signer if available (wallet connected), otherwise readonly provider
      const runner = signer ?? provider;
      const contract = new Contract(
        contractAddress,
        abi,
        runner
      );

      const list = (await contract.getTasks()) as Task[];
      dispatch({ type: "SET_TASKS", tasks: list });
    } catch (e) {
      const msg = getErrorMessage(e);
      dispatch({ type: "ERROR", error: msg });
    } finally {
      dispatch({ type: "SET_LOADING", isLoading: false });
    }
  }, [contractAddress, provider, signer, abi, dispatch]);

  return { loadTasks, tasks: state.tasks, isLoading: state.isLoading };
}
