import { LocalWallet, SmartWallet } from "@thirdweb-dev/wallets";
import { THIRDWEB_API_KEY, chain, factoryAddress } from "./constants";
import { ThirdwebSDK, isContractDeployed } from "@thirdweb-dev/sdk";

export function createSmartWallet(): SmartWallet {
  const smartWallet = new SmartWallet({
    chain: chain,
    factoryAddress: factoryAddress,
    gasless: true,
    clientId: THIRDWEB_API_KEY || "",
  });

  return smartWallet;
}

export async function getWalletAddressForUser(
  sdk: ThirdwebSDK,
  username: string
): Promise<string> {
  const authContract = await sdk.getContract(factoryAddress);
  const smartWalletAddress: string = await authContract.call("accountOfUsername", [
    username,
  ]);
  return smartWalletAddress;
}

export async function connectToSmartWallet(
  username: string,
  pwd: string,
  statusCallback?: (status: string) => void
): Promise<SmartWallet> {
  try {
    statusCallback?.("Check if you already have an account...");
    const sdk = new ThirdwebSDK(chain, {
      clientId: THIRDWEB_API_KEY || "",
    });

    let smartWalletAddress;
    try {
      smartWalletAddress = await getWalletAddressForUser(sdk, username);
      // const isDeployed = await isContractDeployed(
      //   smartWalletAddress,
      //   sdk.getProvider()
      // );
      // console.log("isDeployed", isDeployed)
    } catch (error) {
      console.log("Error fetching wallet address, possibly a new user:", error);
    }

    const smartWallet = createSmartWallet();
    const personalWallet = new LocalWallet();

    try {
      if (smartWalletAddress) {
        statusCallback?.("Existing username, accessing on-chain data...");
        const contract = await sdk.getContract(smartWalletAddress);
        const metadata = await contract.metadata.get();
        const encryptedWallet = metadata.encryptedWallet;

        if (!encryptedWallet) {
          throw new Error("No encrypted wallet found for existing user.");
        }

        statusCallback?.("Decrypting personal wallet...");
        await new Promise((resolve) => setTimeout(resolve, 300)); // To avoid UI freeze
        await personalWallet.import({
          encryptedJson: encryptedWallet,
          password: pwd,
        });

        statusCallback?.("Connecting to SmartWallet...");
        await smartWallet.connect({ personalWallet });
        statusCallback?.("Successfully connected to SmartWallet!");
      } else {
        statusCallback?.("New username, generating personal wallet...");
        await personalWallet.generate();
        const encryptedWallet = await personalWallet.export({
          strategy: "encryptedJson",
          password: pwd,
        });

        await smartWallet.connect({ personalWallet });

        statusCallback?.("Deploying SmartWallet and registering...");
        await smartWallet.deploy();
        const contract = await smartWallet.getAccountContract();
        const encryptedWalletUri = await sdk.storage.upload({
          name: username,
          encryptedWallet,
        });

        await contract.call("register", [username, encryptedWalletUri]);
        statusCallback?.("SmartWallet successfully deployed and registered.");
      }
    } catch (connectionError) {
      console.error("Connection or registration failed:", connectionError);
      statusCallback?.("Failed to connect or register the SmartWallet. Please try again.");
      throw connectionError;
    }

    return smartWallet;
  } catch (error) {
    console.error("Failed to connect to smart wallet:", error);
    statusCallback?.("An unexpected error occurred. Please try again later.");
    throw error;
  }
}
