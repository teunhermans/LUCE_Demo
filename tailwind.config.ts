import { Config } from 'tailwindcss';

const config: Config = {
  content: [

    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  
};

export default config;
