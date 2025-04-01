import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', // Don't run middleware on static files
    '/', // Run middleware on index page
    '/(api|trpc)(.*)', // Run middleware on API routes
    '/sign-in(.*)', // Ensure Sign-in is accessible
    '/sign-up(.*)', // Ensure Sign-up is accessible
  ],
  ignoredRoutes: ["/api/webhooks/clerk"], // Ensure Clerk webhooks bypass authentication
};
