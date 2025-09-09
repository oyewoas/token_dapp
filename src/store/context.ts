import { createContext, useContext } from "react";
import type { Abi } from "viem";
import type { AppAction, AppState } from "./AppState";

export type AppContextValue<State, Action> = {
  state: State;
  dispatch: React.Dispatch<Action>;
  abi: Abi;
};

export const Ctx = createContext<AppContextValue<AppState, AppAction> | null>(
  null
);

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppState must be used within AppStateProvider");
  return v;
}
