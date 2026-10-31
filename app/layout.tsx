import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeMap — Visual Source Code Dependency Analyzer",
  description:
    "Interactive dependency graph for JavaScript and TypeScript codebases. Flag circular dependencies, inspect imports, and assess blast radius in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
