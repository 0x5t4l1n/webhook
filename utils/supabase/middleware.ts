import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // Session middleware - currently not needed for unauthenticated webhook logging
  // Can be extended later for authentication/user management
  
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  return response;
};
