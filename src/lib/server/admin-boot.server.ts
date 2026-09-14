import { hashPassword } from "better-auth/crypto";
import { ADMIN_EMAIL } from "@/lib/admin-email";
import { getDb } from "./helpers";

export { ADMIN_EMAIL };
const ADMIN_PASSWORD = "AoNang#2026";
const ADMIN_NAME = "Manni";
const ADMIN_USER_ID = "admin-krabiconnect";

const g = globalThis as typeof globalThis & { __krabiconnectAdminBoot__?: Promise<void> };

export async function ensureAdmin() {
  g.__krabiconnectAdminBoot__ ??= bootstrapAdmin().catch((err) => {
    g.__krabiconnectAdminBoot__ = undefined;
    throw err;
  });
  return g.__krabiconnectAdminBoot__;
}

async function bootstrapAdmin() {
  const sql = await getDb();
  const existing = await sql<{ id: string }>`
    select id from "user" where email = ${ADMIN_EMAIL} limit 1
  `;
  let userId = existing[0]?.id;
  if (!userId) {
    userId = ADMIN_USER_ID;
    await sql`
      insert into "user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt")
      values (${userId}, ${ADMIN_NAME}, ${ADMIN_EMAIL}, ${true}, ${null}, now(), now())
      on conflict (email) do nothing
    `;
    const again = await sql<{ id: string }>`
      select id from "user" where email = ${ADMIN_EMAIL} limit 1
    `;
    userId = again[0]?.id ?? userId;
  }
  const cred = await sql<{ id: string }>`
    select id from account where "userId" = ${userId} and "providerId" = ${"credential"} limit 1
  `;
  if (!cred[0]) {
    const password = await hashPassword(ADMIN_PASSWORD);
    const accountId = `cred-${userId}`;
    await sql`
      insert into account (
        id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt"
      ) values (
        ${accountId}, ${userId}, ${"credential"}, ${userId}, ${password}, now(), now()
      )
      on conflict (id) do nothing
    `;
  }
  await sql`
    insert into profiles (id, name, preferred_language, is_verified, is_admin, location)
    values (${userId}, ${ADMIN_NAME}, ${"en"}, ${true}, ${true}, ${"ao-nang"})
    on conflict (id) do update set is_admin = true, is_verified = true
  `;
}

export async function requireAdmin(userId: string) {
  await ensureAdmin();
  const sql = await getDb();
  const rows = await sql<{ is_admin: boolean; email: string | null }>`
    select p.is_admin, u.email
    from profiles p
    left join "user" u on u.id = p.id
    where p.id = ${userId}
  `;
  const row = rows[0];
  if (row?.is_admin || row?.email === ADMIN_EMAIL) return;
  throw new Error("Forbidden");
}
