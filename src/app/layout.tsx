import "./globals.css";
export const metadata = {
  title: "Drinkarto — Smarter Distribution",
  description: "B2B beverage distribution operations",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
