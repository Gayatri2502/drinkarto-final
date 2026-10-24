import "@fontsource-variable/inter";
import "./globals.css";
export const metadata = {
  title: "Drinkarto | Liquor references and distribution software",
  description: "Source-linked liquor knowledge and published state price references alongside beverage distribution operations software.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
