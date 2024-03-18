import React, { useEffect, useState } from 'react';
import { useWallet } from '../lib/WalletContext'; 
import { ThirdwebSDK } from '@thirdweb-dev/sdk';


const ERC1155Component = () => {
  const { walletInfo } = useWallet();
  const [tokenBalance, setTokenBalance] = useState('0');
  const [minting, setMinting] = useState(false);
  
  
  
  useEffect(() => {
    const fetchBalance = async () => {
      if (walletInfo.signer) {
      
        const sdk = new ThirdwebSDK(walletInfo.signer);
        
        const contract = await sdk.getContract("0x611E95b33F7A963a49F423F22490eB97e143ee01");
        const walletAddress = walletInfo.signer ? walletInfo.signer.address : ""; 
       // const walletAddress = "{{wallet_address}}"; 
        const tokenId = "0"; // Adjust based on the token you're interested in

        try {
          const balance = await contract.erc1155.balanceOf(walletAddress, tokenId);
          setTokenBalance(balance.toString()); // Adjusted to use displayValue for readability
        } catch (error) {
          console.error('Failed to fetch token balance:', error);
        }
      }
    };

    fetchBalance();
  }, [walletInfo.signer, walletInfo.username]); // Dependency array ensures effect runs when these values change

  const mintToken = async () => {
    if (walletInfo.signer) {
      setMinting(true);

      try {
        const sdk = new ThirdwebSDK(walletInfo.signer);
        const contract = await sdk.getContract("0x611E95b33F7A963a49F423F22490eB97e143ee01");
        const walletAddress = walletInfo.signer ? walletInfo.signer.address : "";  

          const toAddress = walletAddress; 
          const metadata = {
          name: "Cool NFT",
          description: "This is a cool NFT",
          image: "https://example.com/path/to/image.png",
        };
        const metadataWithSupply = {
          metadata,
          supply: 1000,
        };

        // Minting the token
        const tx = await contract.erc1155.mintTo(toAddress, metadataWithSupply);
        console.log("Mint transaction receipt:", tx.receipt);
        const receipt = tx.receipt; 
        const tokenId = tx.id; 
        const nft = await tx.data(); 

        alert("Token minted successfully!");
      } catch (error) {
        console.error("Failed to mint token:", error);
        alert("Failed to mint token.");
      } finally {
        setMinting(false);
      }
    } else {
      alert("Wallet not connected.");
    }
  };

  return (
    <div>
      {walletInfo.username ? (
        <>
          <p>Username: {walletInfo.username}</p>
          <p>Token Balance: {tokenBalance}</p>
          <button onClick={mintToken} disabled={minting}>Mint New Token</button>
        </>
      ) : (
        <p>Please connect your wallet.</p>
      )}
    </div>
  );
};

export default ERC1155Component;
