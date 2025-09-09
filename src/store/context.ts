import { createContext, useContext } from "react";
import type { AppAction, AppState } from "./AppState";
import type { InterfaceAbi } from "ethers";

export type AppContextValue<State, Action> = {
  state: State;
  dispatch: React.Dispatch<Action>;
  abi: InterfaceAbi;
};

export const Ctx = createContext<AppContextValue<AppState, AppAction> | null>(
  null
);

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppState must be used within AppStateProvider");
  return v;
}
