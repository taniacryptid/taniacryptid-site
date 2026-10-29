import { getUser } from "@netlify/identity";

// Only Identity users with the "admin" role can write posts or upload images.
// Returns the admin user, or an error Response explaining why access was refused.
export async function requireAdmin() {
  const user = await getUser();
  if (!user) return { error: unauthorized() };
  if (!user.roles?.includes("admin")) {
    return { error: Response.json({ error: "This account doesn’t have the admin role" }, { status: 403 }) };
  }
  return { user };
}

export async function getAdmin() {
  return (await requireAdmin()).user ?? null;
}

export const unauthorized = () =>
  Response.json({ error: "Your login session couldn’t be verified. Log in again." }, { status: 401 });
