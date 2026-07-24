import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const user = getCurrentUser();
  if (!user) redirect("/admin/login");

  const bookings = user.canBookings
    ? await prisma.booking.findMany({ orderBy: { date: "asc" }, include: { set: true, category: true } })
    : [];

  const sets = user.canSets || user.canBookings
    ? await prisma.set.findMany({ orderBy: { name: "asc" } })
    : [];

  const blockedSlots = user.canBookings
    ? await prisma.blockedSlot.findMany({ orderBy: { date: "asc" } })
    : [];

  const categories = user.canPricing
    ? await prisma.pricingCategory.findMany({ orderBy: { sortOrder: "asc" }, include: { tiers: { orderBy: { hours: "asc" } } } })
    : [];

  const team = user.canTeam ? await prisma.teamMember.findMany({ orderBy: { createdAt: "asc" } }) : [];

  return (
    <AdminDashboard
      user={user}
      initialBookings={JSON.parse(JSON.stringify(bookings))}
      initialSets={JSON.parse(JSON.stringify(sets))}
      initialCategories={JSON.parse(JSON.stringify(categories))}
      initialTeam={JSON.parse(JSON.stringify(team))}
      initialBlockedSlots={JSON.parse(JSON.stringify(blockedSlots))}
    />
  );
}
