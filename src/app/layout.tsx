import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { getSession } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CRM Jurídico",
  description: "Gestão comercial e financeira para advogados",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  // Páginas públicas (login) não têm sidebar
  if (!session) {
    return (
      <html lang="pt-BR" className="h-full">
        <body className={`${inter.className} h-full bg-slate-50`}>{children}</body>
      </html>
    );
  }

  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} h-full flex bg-slate-50`}>
        <Sidebar
          userRole={session.role}
          userName={session.name}
        />
        <main className="flex-1 flex flex-col min-h-screen overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
