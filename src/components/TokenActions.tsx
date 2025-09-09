import { useState } from "react";
import { useAppState } from "../store/context";
import { useTokenActions } from "../hooks/useTokenActions";

export function TokenActions() {
  const { state } = useAppState();
  const { mint, transfer, balanceOf } = useTokenActions();
  const [mintAddress, setMintAddress] = useState("");
  const [transferAddress, setTransferAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [balance, setBalance] = useState<string>("");

  const handleMint = async () => {
    await mint(mintAddress, () => {
      alert("✅ Mint successful");
      setMintAddress("");
    });
  };

  const handleTransfer = async () => {
    await transfer(transferAddress, transferAmount, () => {
      alert("✅ Transfer successful");
      setTransferAmount("");
      setTransferAddress("");
    });
  };

  const handleCheckBalance = async () => {
    const bal = await balanceOf(transferAddress);
    setBalance(bal);
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-800">ERC20 Token Actions</h2>

      {/* Mint */}
      <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
        <label className="block text-sm font-medium text-gray-700">Mint to Address</label>
        <input
          type="text"
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
          placeholder="0x..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
        />
        <label className="block text-sm font-medium text-gray-700">Amount</label>
        <button
          onClick={handleMint}
          disabled={!mintAddress || !state.signer}
          className="w-full rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Mint
        </button>
      </div>

      {/* Transfer */}
      <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
        <label className="block text-sm font-medium text-gray-700">Transfer to Address</label>
        <input
          type="text"
          value={transferAddress}
          onChange={(e) => setTransferAddress(e.target.value)}
          placeholder="0x..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
        />
        <label className="block text-sm font-medium text-gray-700">Amount</label>
        <input
          type="number"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
          placeholder="Amount"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
        />
        <button
          onClick={handleTransfer}
          disabled={!transferAddress || !transferAmount || !state.signer}
          className="w-full rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-medium shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Transfer
        </button>
      </div>

      {/* Balance */}
      <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
        <label className="block text-sm font-medium text-gray-700">Check Balance of Address</label>
        <input
          type="text"
          value={transferAddress}
          onChange={(e) => setTransferAddress(e.target.value)}
          placeholder="0x..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
        />
        <button
          onClick={handleCheckBalance}
          disabled={!transferAddress}
          className="w-full rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check Balance
        </button>
        {balance && (
          <div className="text-center text-sm font-medium text-gray-700">
            Balance: <span className="text-indigo-600">{balance}</span>
          </div>
        )}
      </div>
    </div>
  );
}
