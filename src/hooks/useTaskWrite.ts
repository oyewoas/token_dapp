// src/hooks/useTaskWrite.ts
import { useCallback } from "react";
import { Contract } from "ethers";
import { useAppState } from "../store/context";
import { getErrorMessage } from "../utils/errors";

export function useTaskWrite() {
  const { state, dispatch, abi } = useAppState();
  const { contractAddress, signer } = state;

  const runTx = useCallback(
    async (fn: string, args: unknown[] = [], onSuccess?: () => void) => {
      if (!contractAddress || !signer) {
        dispatch({ type: "ERROR", error: "Wallet not connected" });
        return;
      }

      dispatch({ type: "SET_TX", txPending: true });
      dispatch({ type: "ERROR", error: "" });

      try {
        const contract = new Contract(contractAddress, abi, signer);

        // send tx
        const tx = await contract[fn](...args);
        const receipt = await tx.wait();
        if (receipt?.status === 1) {
          onSuccess?.();
        } else {
          dispatch({ type: "ERROR", error: "Transaction failed" });
        }
      } catch (e) {
        const msg = getErrorMessage(e);
        dispatch({ type: "ERROR", error: msg });
      } finally {
        dispatch({ type: "SET_TX", txPending: false });
      }
    },
    [contractAddress, signer, abi, dispatch]
  );

  return {
    createTask: (desc: string, onSuccess?: () => void) =>
      runTx("createTask", [desc], onSuccess),
    updateTask: (id: bigint, desc: string, onSuccess?: () => void) =>
      runTx("updateTask", [id, desc], onSuccess),
    completeTask: (id: bigint, onSuccess?: () => void) =>
      runTx("completeTask", [id], onSuccess),
  };
}
