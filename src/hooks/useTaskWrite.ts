// src/hooks/useTaskWrite.ts
import { useCallback, useMemo } from "react";
import { useAppState } from "../store/context";
import { defineChain } from "viem";
import { getErrorMessage } from "../utils/errors";

export function useTaskWrite() {
  const { state, dispatch, abi } = useAppState();
  const { contractAddress, walletClient, chainId, account, publicClient } = state;
  const chain = useMemo(() => {
    if (!chainId) return undefined;
    return defineChain({
      id: chainId,
      name: `Chain ${chainId}`,
      nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
      rpcUrls: { default: { http: [] }, public: { http: [] } },
    });
  }, [chainId]);
  const runTx = useCallback(
    async (fn: string, args: unknown[] = [], onSuccess?: () => void) => {
      if (!contractAddress || !walletClient || !account) {
        dispatch({ type: "ERROR", error: "Wallet not connected" });
        return;
      }

      dispatch({ type: "SET_TX", txPending: true });
      dispatch({ type: "ERROR", error: "" });

      try {
        const hash = await walletClient.writeContract({
          address: contractAddress,
          abi,
          functionName: fn,
          args,
          account,
          chain,
        });
        // wait for receipt
        const receipt = await publicClient?.waitForTransactionReceipt({ hash });
        if (receipt?.status === "success") {
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
    [contractAddress, walletClient, account, abi, chain, dispatch, publicClient]
  );

  return {
    createTask: (desc: string, onSuccess?: () => void) => runTx("createTask", [desc], onSuccess),
    updateTask: (id: bigint, desc: string, onSuccess?: () => void) => runTx("updateTask", [id, desc], onSuccess),
    completeTask: (id: bigint, onSuccess?: () => void) => runTx("completeTask", [id], onSuccess),
  };
}
