import React from 'react'
import type { AppProps } from 'next/app'
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import '../styles/globals.css'
const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ["thai"], // เพิ่ม subsets ที่ต้องการ
  variable: "--font-ibm-plex-sans-thai",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});
import Sidebar from '../components/sidebar'
// import '../fontawesome';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={ibmPlexSansThai.className}> {/* ใช้ฟอนต์ผ่าน className */}
      <div className="flex">
        <Sidebar /> {/* Sidebar will appear on all pages */}
        <div className="flex-grow">
          <Component {...pageProps} />
        </div>
      </div>
    </div>
  );
}

export default MyApp;
