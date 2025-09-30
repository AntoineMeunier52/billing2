import { requireAuth } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  requireAuth(event);

  return {
    success: true,
    message: "Logged out successfully",
  };
});
