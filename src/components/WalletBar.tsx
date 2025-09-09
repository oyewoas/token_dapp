import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAppState } from "../store/context";

export function WalletBar({
  account,
  chainLabel,
  onConnect,
  onDisconnect,
}: {
  account: string | null;
  chainLabel: string;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const [balance, setBalance] = useState<string>("");
  const { state } = useAppState();
  const { provider } = state;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadBalance() {
      if (!account || !provider) {
        setBalance("");
        return;
      }
      try {
        const bal = await provider.getBalance(account);
        if (!active) return;
        setBalance(`${ethers.formatEther(bal)} ETH`);
      } catch (e) {
        console.error("Failed to fetch balance:", e);
        setBalance("");
      }
    }
    loadBalance();
    return () => {
      active = false;
    };
  }, [account, provider]);

  const handleCopy = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-lg flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
          Network
        </span>
        <span className="text-sm font-bold text-indigo-900">{chainLabel || "Unknown"}</span>
      </div>

      {/* Account Info */}
      <div className="space-y-2">
        <div>
          <span className="block text-xs font-semibold text-indigo-600 uppercase">
            Account
          </span>
          <span
            className="text-sm font-mono text-gray-900 truncate block max-w-full"
            title={account || "Not connected"}
          >
            {account || "Not connected"}
          </span>
        </div>

        {balance && (
          <div>
            <span className="block text-xs font-semibold text-green-600 uppercase">
              Balance
            </span>
            <span className="text-sm font-semibold text-green-700">{balance}</span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {account ? (
          <>
            <button
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:scale-105 transition"
              onClick={onDisconnect}
            >
              Disconnect
            </button>
            <button
              className="w-full sm:w-auto text-xs bg-indigo-100 px-3 py-2 rounded-xl hover:bg-indigo-200 transition font-semibold"
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </>
        ) : (
          <button
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:scale-105 transition disabled:bg-indigo-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={onConnect}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
