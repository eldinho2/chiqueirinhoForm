import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { admins } from "./lib/admins";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const role = session?.user?.role || "user";

  const currentPath = request.nextUrl.pathname;

  if (currentPath === "/login") {
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }


  if (currentPath.startsWith("/dashboard")) {
    if (!session || !admins.includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  if (currentPath.startsWith("/oincpoints")) {
    if (!session || !admins.includes(role) || role === "Ajudante ‍⚖️") {      
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
