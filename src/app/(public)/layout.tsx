import { cookies } from "next/headers";
import PublicFrame from "@/components/public-frame";
import "./public.css";
import "./professional.css";
import "./knowledge.css";
import "./mobile.css";
import "./editorial.css";
import "./modular.css";
export const metadata = {
  title: {
    default: "Drinkarto | Liquor price references and knowledge",
    template: "%s · Drinkarto",
  },
  description:
    "Browse dated liquor price references from linked state sources, compare wine and spirit styles, and read source-linked guides for adults.",
};
export default async function Layout({ children }: { children: React.ReactNode }) {
  const confirmed = (await cookies()).get("drinkarto-adult-access")?.value === "confirmed";
  return <PublicFrame adultConfirmed={confirmed}>{children}</PublicFrame>;
}
