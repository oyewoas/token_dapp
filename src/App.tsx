// src/App.tsx
import { ethers } from "ethers";
import { WalletBar } from "./components/WalletBar";
import { useAppState } from "./store/context";
import { getErrorMessage } from "./utils/errors";
import { getChainLabel } from "./utils/chain";
import { TokenActions } from "./components/TokenActions";

function App() {
  const { state, dispatch } = useAppState();

  // Wallet Actions
  async function connectWallet() {
    const eth = window.ethereum;
    if (!eth) return;

    try {
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const addr = await signer.getAddress();

      dispatch({
        type: "SET_CLIENTS",
        signer,
        provider,
        chainId: Number(network.chainId),
        account: addr,
      });

      dispatch({
        type: "NOTICE",
        text: `Wallet connected: ${addr.slice(0, 6)}…${addr.slice(-4)}`,
      });
    } catch (e) {
      dispatch({ type: "ERROR", error: getErrorMessage(e) });
    }
  }

  async function disconnectWallet() {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
      dispatch({
        type: "SET_CLIENTS",
        signer: null,
        provider: null,
        chainId: null,
        account: null,
      });
    } catch (e) {
      dispatch({ type: "ERROR", error: getErrorMessage(e) });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 text-gray-900 flex flex-col">
      {/* Header / Wallet */}
   <header className="w-full border-b border-gray-200 bg-white/70 backdrop-blur-md sticky top-0 z-20">
  <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
    {/* Title */}
    <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 tracking-tight text-center sm:text-left">
      Task DApp
    </h1>

    {/* WalletBar */}
    <div className="w-full sm:w-auto">
      <WalletBar
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        account={state.account}
        chainLabel={getChainLabel(state.chainId)}
      />
    </div>
  </div>
</header>


      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Token Actions
          </h2>
          <TokenActions />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500">
        Built with <span className="text-indigo-500">ethers.js</span> & Tailwind
      </footer>
    </div>
  );
}

export default App;
