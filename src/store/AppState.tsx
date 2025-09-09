import { useCallback, useEffect, useReducer } from "react";
import type {
  Abi,
  Address,
  EIP1193Provider,
  PublicClient,
  WalletClient,
  Hash,
} from "viem";
import {
  createPublicClient,
  createWalletClient,
  custom,
  decodeEventLog,
} from "viem";
import abi from "../utils/abi.json";
import { Ctx } from "./context";

const CONTRACT_ADDRESS =
  typeof import.meta.env.VITE_CONTRACT_ADDRESS === "string" &&
  import.meta.env.VITE_CONTRACT_ADDRESS.startsWith("0x")
    ? (import.meta.env.VITE_CONTRACT_ADDRESS as Address)
    : "0x5f4e91138f7557227fD80c7417c3ecED2A4f9E4b";

export type Task = { id: bigint; description: string; completed: boolean };

export type LogEntry = { text: string; hash?: Hash };
export type NoticeEntry = { text: string };

export type AppState = {
  publicClient: PublicClient | null;
  walletClient: WalletClient | null;
  ethClient: EIP1193Provider | null;
  account: Address | null;
  contractAddress: Address | null;
  chainId: number | null;
  tasks: Task[];
  isLoading: boolean;
  txPending: boolean;
  notices: NoticeEntry[];
  logs: LogEntry[];
  error: string;
};

export type AppAction =
  | {
      type: "SET_CLIENTS";
      publicClient: PublicClient | null;
      walletClient: WalletClient | null;
      ethClient: EIP1193Provider | null;
      chainId: number | null;
      account: Address | null;
    }
  | { type: "SET_ACCOUNT"; account: Address | null }
  | { type: "SET_CHAIN_ID"; chainId: number | null }
  | { type: "SET_TASKS"; tasks: Task[] }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "SET_TX"; txPending: boolean }
  | { type: "SET_LOGS"; logs: LogEntry[] }
  | { type: "NOTICE"; text: string }
  | { type: "LOG"; text: string; hash?: Hash }
  | { type: "ERROR"; error: string };

const initial: AppState = {
  publicClient: null,
  walletClient: null,
  ethClient: null,
  account: null,
  chainId: null,
  tasks: [],
  isLoading: false,
  txPending: false,
  contractAddress: CONTRACT_ADDRESS,
  notices: [],
  logs: [],
  error: "",
};

function reducer(state: AppState, a: AppAction): AppState {
  switch (a.type) {
    case "SET_CLIENTS":
      return {
        ...state,
        publicClient: a.publicClient,
        walletClient: a.walletClient,
        ethClient: a.ethClient,
        chainId: a.chainId,
        account: a.account,
      };
    case "SET_ACCOUNT":
      return { ...state, account: a.account };
    case "SET_CHAIN_ID":
      return { ...state, chainId: a.chainId };
    case "SET_TASKS":
      return { ...state, tasks: a.tasks };
    case "SET_LOADING":
      return { ...state, isLoading: a.isLoading };
    case "SET_TX":
      return { ...state, txPending: a.txPending };
    case "SET_LOGS":
      return { ...state, logs: a.logs };
    case "NOTICE":
      return {
        ...state,
        notices: [{ text: a.text }, ...state.notices].slice(0, 5),
      };
    case "LOG":
      return {
        ...state,
        logs: [{ text: a.text, hash: a.hash }, ...state.logs].slice(
          0,
          25
        ),
      };
    case "ERROR":
      return { ...state, error: a.error };
    default:
      return state;
  }
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const taskAbi = abi as unknown as Abi;

  const EventSwitch = useCallback(
    (eventName: string, args?: Record<string, unknown>) => {
      switch (eventName) {
        case "TaskCreated": {
          dispatch({
            type: "LOG",
            text: `Event TaskCreated: ${(args?.description as string) || "Event TaskCreated"}`,
            hash: args?.hash as Hash,
          });
          break;
        }
        case "TaskUpdated": {
          const id = args?.id as bigint;
          const desc = args?.description as string;
          dispatch({
            type: "LOG",
            text: `Event TaskUpdated: #${id}${desc ? ` -> ${desc}` : ""}`,
            hash: args?.hash as Hash,
          });
          break;
        }
        case "TaskCompleted": {
          const id = args?.id as bigint;
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

  useEffect(() => {
    if (!state.contractAddress) return;

    let accountsHandler: ((as: string[]) => void) | null = null;
    let chainHandler: ((hex: string) => void) | null = null;

    async function init() {
      try {
        const eth = window.ethereum;
        if (!eth) return;

        const wallet = createWalletClient({ transport: custom(eth) });
        const pub = createPublicClient({ transport: custom(eth) });
        const id = await wallet.getChainId();
        const [addr] = await wallet.getAddresses();

        // fetch historical logs safely
        try {
          if (!state.contractAddress) return;
          const logs = await pub.getLogs({
            address: state.contractAddress,
            fromBlock: 0n,
            toBlock: "latest",
          });
          for (const log of logs) {
            try {
              const { eventName, args } = decodeEventLog({
                abi,
                data: log.data,
                topics: log.topics,
              });
              if (eventName) {
                EventSwitch(eventName, {
                  ...args,
                  hash: log.transactionHash,
                });
              }
            } catch (err) {
              console.warn("Failed to decode log:", log, err);
            }
          }
        } catch (err) {
          console.warn("Failed to fetch logs:", err);
        }

        dispatch({
          type: "SET_CLIENTS",
          publicClient: pub,
          walletClient: wallet,
          ethClient: eth,
          chainId: id,
          account: addr ?? null,
        });

        // attach listeners
        accountsHandler = (as: string[]) =>
          dispatch({
            type: "SET_ACCOUNT",
            account: (as?.[0] as Address) ?? null,
          });

        chainHandler = (hex: string) =>
          dispatch({
            type: "SET_CHAIN_ID",
            chainId: Number(hex) || null,
          });

        eth.on?.("accountsChanged", accountsHandler);
        eth.on?.("chainChanged", chainHandler);
      } catch (e) {
        dispatch({
          type: "ERROR",
          error: e instanceof Error ? e.message : "Failed to initialize wallet",
        });
      }
    }

    init();

    return () => {
      if (accountsHandler)
        window.ethereum?.removeListener?.("accountsChanged", accountsHandler);
      if (chainHandler)
        window.ethereum?.removeListener?.("chainChanged", chainHandler);
    };
  }, [EventSwitch, state.contractAddress]);

  return (
    <Ctx.Provider value={{ state, dispatch, abi: taskAbi }}>
      {children}
    </Ctx.Provider>
  );
}
