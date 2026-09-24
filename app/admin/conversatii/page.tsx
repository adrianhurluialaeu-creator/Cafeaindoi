import AdminConversationHub from "../../../components/AdminConversationHub";
import AdminShell from "../../../components/AdminShell";
import { readConversation } from "../../../lib/conversation";
import { listInvitations, type Invitation } from "../../../lib/invitations";
export const metadata = {
  title: "Conversații · Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
function uniqueActive(rows: Invitation[]) {
  const emails = new Set<string>();
  return rows.filter((item) => {
    if (item.portalAccessStatus !== "active") return false;
    const email = item.email?.trim().toLowerCase();
    if (!email) return true;
    if (emails.has(email)) return false;
    emails.add(email);
    return true;
  });
}
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const active = uniqueActive(await listInvitations()),
    items = await Promise.all(
      active.map(async (item) => {
        const conversation = await readConversation(item.id),
          last = conversation?.messages.at(-1);
        return {
          id: item.id,
          prenume: item.prenume,
          localitate: item.localitate,
          tara: item.tara,
          lastMessage: last?.text,
          lastActivityAt: last?.createdAt,
          expiresAt: conversation?.expiresAt,
          meetingStatus: conversation?.meeting?.status,
        };
      }),
    ),
    selectedId = (await searchParams).id || "";
  return (
    <AdminShell
      title="Conversații"
      subtitle="Mesagerie privată și întâlniri video Cafea în Doi."
    >
      <AdminConversationHub items={items} selectedId={selectedId} />
    </AdminShell>
  );
}
