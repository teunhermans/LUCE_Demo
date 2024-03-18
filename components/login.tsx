import React, { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import loadingLottie from "../assets/lottie/loadingimage.webp";
import { connectToSmartWallet } from '../lib/wallets';
import { useRouter } from 'next/router';  
import { useWallet } from '../lib/WalletContext'; 

type LoginProps = {
    isOpen: boolean;
    onClose: () => void;
};

export const Login: React.FC<LoginProps> = ({ isOpen, onClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [error, setError] = useState('');
    const [isClient, setIsClient] = useState(false);
    const router = useRouter(); 

    // Use the useWallet hook here
    const { setWalletInfo } = useWallet();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.currentTarget === e.target) {
            onClose();
        }
    };

    const connectWallet = async () => {
        if (!username || !password) {
            setError('Please enter username and password');
            return;
        }

        setIsLoading(true);
        setLoadingStatus("Attempting to connect...");
        try {
            const wallet = await connectToSmartWallet(username, password, (status) => setLoadingStatus(status));
            const s = await wallet.getSigner();
            if (s) {
                // Update the global wallet info state
                setWalletInfo({ signer: s, username: username });
                router.push('/erc1155');
            } else {
                throw new Error("Failed to obtain signer from the wallet.");
            }
        } catch (error) {
            console.error("Connection error:", error);
            setError("Incorrect credentials or connection failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`${styles.loginContainer} ${isOpen ? styles.open : ""}`} onClick={handleOutsideClick}>
            {isLoading ? (
                <div className={styles.card}>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "440px",
                    }}>
                        
                        <p>{loadingStatus}</p>
                    </div>
                </div>   
            ) : error ? (
                <div> 
                    <p>{error}</p> 
                    <button onClick={() => setError("")}>Try again</button>
                </div>
            ) : (
                <div className={`${styles.loginCard} p-8 space-y-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg`}>
                    <button onClick={onClose} className="text-right font-semibold underline text-black">Close</button>
                    <div className="text-center">
                        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-500 shadow-xl">
                            Login
                        </h1>
                    </div>
                    <div className={`${styles.loginInput} space-y-4`}>
                        <input
                            className="input-black w-full p-2 border rounded shadow-sm"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            className="input-black w-full p-2 border rounded shadow-sm"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button className="w-full py-2 mt-2 text-white bg-gradient-to-r from-blue-400 to-teal-500 rounded hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" onClick={connectWallet}>
                            Login
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
    
};
