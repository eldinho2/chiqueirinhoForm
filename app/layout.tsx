import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react"


export const metadata: Metadata = {
  title: "Chiqueirinho Form 🐷",
  description: "Formulário do Chiqueirinho - 🐷",
  keywords: ["formulário", "chiqueirinho", "gerenciamento", "sistema", "chiqueirinho form", "form", "ava form", "ava", "chiqueirinho ava"],
  authors: [{ name: "Chiqueirinho" }],
  creator: "Chiqueirinho",
  publisher: "Chiqueirinho",
  metadataBase: new URL("https://chiqueirinho-form.vercel.app"),
  openGraph: {
    title: "Chiqueirinho Form 🐷",
    description: "Formulário do Chiqueirinho - 🐷",
    url: "https://chiqueirinho-form.vercel.app",
    siteName: "Chiqueirinho Form",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/chiqueirinhologo.webp",
        width: 1200,
        height: 630,
        alt: "Chiqueirinho Form Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chiqueirinho Form 🐷",
    description: "Formulário do Chiqueirinho - 🐷",
    images: ["/chiqueirinhologo.webp"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
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
