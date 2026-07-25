import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DepositPayment from "@/components/DepositPayment";
import { hoursLabel } from "@/lib/types";
import { getSettings } from "@/lib/settings";

export default async function ConfirmBookingPage({ params }: { params: { bookingId: string } }) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: { set: true, category: true },
  });
  if (!booking) notFound();

  const settings = await getSettings();
  const packageName = `${booking.category.label} · ${booking.tierHours} ${hoursLabel(booking.tierHours)}`;

  return (
    <section className="mx-auto max-w-lg px-5 py-16">
      <DepositPayment
        bookingId={booking.id}
        setName={booking.set.name}
        packageName={packageName}
        date={booking.date.toISOString().slice(0, 10)}
        startTime={booking.startTime}
        depositAmount={booking.depositAmount}
        customerName={booking.customerName}
        initialStatus={booking.status}
        transferNumber={settings.transferNumber}
      />
    </section>
  );
}
