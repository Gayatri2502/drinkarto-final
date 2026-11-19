import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = await request.formData();
  if (form.get("adultConfirmation") !== "on") {
    return NextResponse.redirect(new URL("/responsible-use", request.url), 303);
  }
  const destination = String(form.get("destination") ?? "/");
  const safePath = destination.startsWith("/") && !destination.startsWith("//") && !destination.includes("\\") ? destination : "/";
  const response = NextResponse.redirect(new URL(safePath, request.url), 303);
  response.cookies.set("drinkarto-adult-access", "confirmed", {
    httpOnly: true, sameSite: "lax", secure: new URL(request.url).protocol === "https:", maxAge: 604800, path: "/",
  });
  return response;
}
