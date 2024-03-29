import { LocalWallet, SmartWallet } from "@thirdweb-dev/wallets";
import { THIRDWEB_API_KEY, chain, factoryAddress} from "./constants";
import { ThirdwebSDK, Transaction, isContractDeployed} from "@thirdweb-dev/react";

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
  console.log("AUTH CONRACT: ", authContract);
  const smartWalletAddress: string = await authContract.call("accountOfUserName", [
    username,
  ]);
  return smartWalletAddress;
}

export async function connectToSmartWallet(
  username: string,
  pwd: string,
  statusCallback?: (status: string) => void
): Promise<SmartWallet> {
  
    statusCallback?.("Check if you already have an account...");
    const sdk = new ThirdwebSDK(chain, {
      clientId: THIRDWEB_API_KEY || "",
    } ); 
  
    const smartWalletAddress = await getWalletAddressForUser(sdk, username);
    const isDeployed = await isContractDeployed(
      smartWalletAddress,
      sdk.getProvider()
    );
  
    const smartWallet = createSmartWallet();
    const personalWallet = new LocalWallet();
  
    if (isDeployed) {
      statusCallback?.("Username exists, accessing onchain data...");
      // CASE 2 - existing wallet - fetch metadata, decrypt, load local wallet, connect
      // download encrypted wallet from IPFS
      const contract = await sdk.getContract(smartWalletAddress);
      const metadata = await contract.metadata.get(); 
      const encryptedWallet = metadata.encryptedWallet;
      if (!encryptedWallet) {
        throw new Error("No encrypted wallet found");
      }
      statusCallback?.("Decrypting personal wallet...");
      // wait before importing as it blocks the main thread rendering
      await new Promise((resolve) => setTimeout(resolve, 300));
      await personalWallet.import({
        encryptedJson: encryptedWallet,
        password: pwd,
      });
  
      statusCallback?.("Connecting...");
      await smartWallet.connect({
        personalWallet,
      });

      return smartWallet;

    } else 
  
    {
      statusCallback?.("New username, generating personal wallet...");
      // CASE 1 - fresh start - create local wallet, encrypt, connect, call register on account with username + metadata
      // generate local wallet
      await personalWallet.generate();
      // encrypt it
      const encryptedWallet = await personalWallet.export({
        strategy: "encryptedJson",
        password: pwd,
      });
  
      await smartWallet.connect({
        personalWallet,
      });
  
      statusCallback?.(`Deploying & registering username onchain...`);
      // this will deploy the smart wallet and register the username
      await smartWallet.deploy();
      const contract = await smartWallet.getAccountContract();
      const encryptedWalletUri = await sdk.storage.upload({
        name: username,
        encryptedWallet,

      }); 

      await contract.call(
        "register",
        [username, encryptedWalletUri]
      );
  
    return smartWallet;
  }
}