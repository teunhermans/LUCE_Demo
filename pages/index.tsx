import { NextPage } from "next";
import { useState } from "react";
import { Login } from "../components/login";
import backgroundImage from '../assets/lottie/loadingimage.webp';

const Home: NextPage = () => {
  const [isLoginPage, setIsLoginPage] = useState(false);

  const goToLoginPage = () => {
    setIsLoginPage(true);
  };

  const handleCloseLogin = () => {
    setIsLoginPage(false);
  };

  return (
<div className="flex items-start justify-end min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage.src})` }}>
  {isLoginPage ? (
    <Login isOpen={true} onClose={handleCloseLogin} />
  ) : (
    <div className="w-full max-w-md p-8 space-y-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg m-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-500 shadow-xl">
          m-LUCE Login
        </h1>
       
        <button
          className="w-full py-2 mt-4 text-white bg-gradient-to-r from-blue-400 to-teal-500 rounded hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          onClick={goToLoginPage}
        >
          Login
        </button>
      </div>
     
      <p className="text-gray-600 mt-4">
        Securely access your dashboard to monitor and manage the lifecycle of your model cards with transparency and efficiency, powered by blockchain technology.
      </p>
    </div>
  )}
</div>


  );
};

export default Home;
