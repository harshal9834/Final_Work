import './globals.css';
import WSProvider from '@/components/WSProvider';
import NavBar from '@/components/NavBar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen w-screen bg-[#F8FAFC] text-[#0F172A] font-sans overflow-hidden flex flex-col">
        <WSProvider>
          <NavBar />
          <main className="flex-1 overflow-auto bg-[#F8FAFC]">{children}</main>
        </WSProvider>
      </body>
    </html>
  );
}
