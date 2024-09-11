import React from 'react'
import type { AppProps } from 'next/app'

import '../styles/globals.css'
import Sidebar from '../components/sidebar'
// import '../fontawesome';
function MyApp({ Component, pageProps }: AppProps) {
  return <div className="flex">
  <Sidebar /> {/* Sidebar will appear on all pages */}
  <div className="flex-grow">
    <Component {...pageProps} />
  </div>
</div>
}

export default MyApp
