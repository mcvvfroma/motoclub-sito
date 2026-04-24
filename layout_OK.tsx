import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata = {
  title: "RideRoute",
  description: "Moto Club App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <SidebarProvider>
          <main>{children}</main>
        </SidebarProvider>
      </body>
    </html>
  );
}
