import type { AppProps } from "next/app";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import "../styles/globals.css";
import '../styles/output.css';
import { WalletProvider } from '../lib/WalletContext'; 


// This is the chain your dApp will work on.
// Change this to the chain your app is built for.
// You can also import additional chains from `@thirdweb-dev/chains` and pass them directly.
const activeChain = "mumbai";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
      activeChain={activeChain}
    >
      {/* Wrap the component tree with the WalletProvider */}
      <WalletProvider>
        <Component {...pageProps} />
      </WalletProvider>
    </ThirdwebProvider>
  );
}

export default MyApp;
