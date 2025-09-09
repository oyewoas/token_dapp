import { useCallback } from "react";
import { Contract } from "ethers";
import { useAppState } from "../store/context";
import { getErrorMessage } from "../utils/errors";

export function useTokenActions() {
  const { state, dispatch, abi } = useAppState();
  const { contractAddress, signer } = state;

  // Mint tokens to an address
  const mint = useCallback(
    async (to: string, onSuccess?: () => void) => {
      if (!contractAddress || !signer) {
        dispatch({ type: "ERROR", error: "Wallet not connected" });
        return;
      }
      dispatch({ type: "SET_TX", txPending: true });
      dispatch({ type: "ERROR", error: "" });
      try {
        const contract = new Contract(contractAddress, abi, signer);
        const tx = await contract.mint(to);
        await tx.wait();
        onSuccess?.();
      } catch (e) {
        dispatch({ type: "ERROR", error: getErrorMessage(e) });
      } finally {
        dispatch({ type: "SET_TX", txPending: false });
      }
    },
    [contractAddress, signer, abi, dispatch]
  );

  // Transfer tokens to an address
  const transfer = useCallback(
    async (to: string, value: string, onSuccess?: () => void) => {
      if (!contractAddress || !signer) {
        dispatch({ type: "ERROR", error: "Wallet not connected" });
        return;
      }
      dispatch({ type: "SET_TX", txPending: true });
      dispatch({ type: "ERROR", error: "" });
      try {
        const contract = new Contract(contractAddress, abi, signer);
        const tx = await contract.transfer(to, value);
        await tx.wait();
        onSuccess?.();
      } catch (e) {
        dispatch({ type: "ERROR", error: getErrorMessage(e) });
      } finally {
        dispatch({ type: "SET_TX", txPending: false });
      }
    },
    [contractAddress, signer, abi, dispatch]
  );

  // Read balance of an address
  const balanceOf = useCallback(
    async (address: string): Promise<string> => {
      if (!contractAddress || !signer) return "0";
      try {
        const contract = new Contract(contractAddress, abi, signer);
        const bal = await contract.balanceOf(address);
        return bal.toString();
      } catch {
        return "0";
      }
    },
    [contractAddress, signer, abi]
  );

  return { mint, transfer, balanceOf };
}
