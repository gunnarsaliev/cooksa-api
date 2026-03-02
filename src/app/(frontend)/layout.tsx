import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Managing the content for the Cooksa AI chatbot',
  title: 'Cooksa API',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
