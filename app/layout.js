import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'উদ্ধার - Emergency Response System',
  description: 'Track and manage assistance for victims of tragic incidents',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className={inter.className}>{children}</body>
    </html>
  )
}