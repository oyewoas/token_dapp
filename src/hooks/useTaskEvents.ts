// src/hooks/useTaskEvents.ts
import { useEffect } from "react";
import { ethers } from "ethers";
import { useAppState } from "../store/context";

export function useTaskEvents() {
  const { state, dispatch, abi } = useAppState();
  const { provider, contractAddress } = state;

  useEffect(() => {
    if (!provider || !contractAddress) return;

    const contract = new ethers.Contract(contractAddress, abi, provider);

    // --- Handlers ---
    function onCreated(id: bigint, description: string, event: ethers.EventLog) {
      const text = `TaskCreated #${id}: ${description}`;
      dispatch({ type: "NOTICE", text });
      dispatch({ type: "LOG", text, hash: event.transactionHash });
    }

    function onUpdated(id: bigint, description: string, event: ethers.EventLog) {
      const text = `TaskUpdated #${id} -> ${description}`;
      dispatch({ type: "NOTICE", text });
      dispatch({ type: "LOG", text, hash: event.transactionHash });
    }

    function onCompleted(id: bigint, event: ethers.EventLog) {
      const text = `TaskCompleted #${id}`;
      dispatch({ type: "NOTICE", text });
      dispatch({ type: "LOG", text, hash: event.transactionHash });
    }

    // --- Attach listeners ---
    contract.on("TaskCreated", onCreated);
    contract.on("TaskUpdated", onUpdated);
    contract.on("TaskCompleted", onCompleted);

    // --- Cleanup ---
    return () => {
      contract.removeAllListeners();
    };
  }, [provider, contractAddress, abi, dispatch]);
}
