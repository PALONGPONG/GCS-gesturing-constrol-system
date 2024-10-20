import React, { useEffect, useRef, useState } from 'react'
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
import WebSocketClient from '../service/websocketClient';
import { handleApiRequest } from '../service/recieve_get_and_do';
function MyApp({ Component, pageProps }: AppProps) {
  const [latestMessage, setLatestMessage] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  useEffect(() => {
    const connect = () => {
      const socket = new WebSocket('ws://localhost:8765')

      socket.onopen = () => {
        console.log('Connected to WebSocket Server')
        setIsConnected(true)
      }

      socket.onmessage = (event) => {
        console.log('Received:', event.data)
        setLatestMessage(event.data)
      }

      socket.onclose = () => {
        console.log('WebSocket connection closed, retrying in 5 seconds...')
        setIsConnected(false)
        setTimeout(connect, 1) // พยายามเชื่อมต่อใหม่ทุก 5 วินาที
      }

      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        socket.close()
      }

      wsRef.current = socket
    }

    connect()

    return () => {
      wsRef.current?.close()
    }
  }, [])

  useEffect(() => {
    if (latestMessage) {
      handleApiRequest(parseInt(latestMessage));
    }
  }
    , [latestMessage]);
  console.log("_app", latestMessage);
  return (
    <div className={ibmPlexSansThai.className}> {/* ใช้ฟอนต์ผ่าน className */}
      <div className="flex">
        <Sidebar /> {/* Sidebar will appear on all pages */}
        <div className="flex-grow">
        <Component {...pageProps} latestMessage={latestMessage} isConnected={isConnected} />
        </div>
      </div>
    </div>
  );
}

export default MyApp;
