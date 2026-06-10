import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * /login と /api/auth/* 以外のすべてのルートを保護
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
