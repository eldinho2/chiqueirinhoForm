import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react"


export const metadata: Metadata = {
  title: "Chiqueirinho Form 🐷",
  description: "Formulário do Chiqueirinho 🐷",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html lang="pt-br">
        <body>
          {children}
        </body>
      </html>
    </SessionProvider>
  );
}
