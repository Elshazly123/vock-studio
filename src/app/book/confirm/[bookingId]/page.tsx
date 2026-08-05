import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DepositPayment from "@/components/DepositPayment";
import { hoursLabel } from "@/lib/types";
import { getSettings } from "@/lib/settings";
import { getLocale } from "@/lib/locale";

export default async function ConfirmBookingPage({ params }: { params: { bookingId: string } }) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: { set: true, category: true },
  });
  if (!booking) notFound();

  const settings = await getSettings();
  const locale = getLocale();
  const categoryLabel = locale === "ar" ? booking.category.label : booking.category.labelEn || booking.category.label;
  const packageName = `${categoryLabel} · ${booking.tierHours} ${hoursLabel(booking.tierHours, locale)}`;
  const setName = locale === "ar" ? booking.set.name : booking.set.nameEn || booking.set.name;

  return (
    <section className="mx-auto max-w-lg px-5 py-16">
      <DepositPayment
        bookingId={booking.id}
        setName={setName}
        packageName={packageName}
        date={booking.date.toISOString().slice(0, 10)}
        startTime={booking.startTime}
        durationHours={booking.tierHours}
        depositAmount={booking.depositAmount}
        customerName={booking.customerName}
        initialStatus={booking.status}
        transferNumber={settings.transferNumber}
        address={settings.address}
        locale={locale}
      />
    </section>
  );
}
