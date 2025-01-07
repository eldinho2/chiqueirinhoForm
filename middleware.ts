import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const role = session?.user?.email;

  const currentPath = request.nextUrl.pathname;
  
  if (currentPath === "/login") {
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (currentPath === "/dashboard") {
    if (role !== "viniciusfod@gmail.com") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
