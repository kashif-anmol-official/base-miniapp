import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();

  if (isConnected) {
    return (
      <p style={{ fontSize: 14 }}>
        Connected: {address.slice(0, 6)}...{address.slice(-4)}
      </p>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      disabled={isPending}
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
