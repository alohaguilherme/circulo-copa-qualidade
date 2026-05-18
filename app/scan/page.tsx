import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ScanPage({ searchParams }: Props) {
  const session = await getSession();
  const { token } = await searchParams;

  if (!token) redirect("/album");
  if (!session) redirect(`/login?next=/scan?token=${token}`);

  const result = await db.execute({
    sql: "SELECT id FROM protocols WHERE qr_token = ?",
    args: [token],
  });

  if (result.rows.length === 0) redirect("/album");

  const protocolId = result.rows[0].id as string;
  redirect(`/album/${protocolId}?token=${encodeURIComponent(token)}`);
}
