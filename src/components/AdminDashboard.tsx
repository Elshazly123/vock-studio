"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SessionPayload } from "@/lib/auth";
import { formatEGP, depositFor, hoursLabel } from "@/lib/types";
import {
  logout,
  confirmBooking,
  addSet,
  updateSet,
  deleteSet,
  addSetImage,
  removeSetImage,
  updateTier,
  addCategory,
  deleteCategory,
  addTier,
  deleteTier,
  addTeamMember,
  removeTeamMember,
  toggleTeamPermission,
  addBlockedSlot,
  removeBlockedSlot,
  updateSettings,
  getCoupons,
  addCoupon,
  toggleCoupon,
  deleteCoupon,
  getWaitlist,
  removeWaitlistEntry,
  getStats,
  updateInstagramPosts,
} from "@/lib/admin-actions";

type BookingRow = {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  startTime: string;
  depositAmount: number;
  status: string;
  set: { name: string };
  category: { label: string };
  tierHours: number;
  paymentProofUrl: string | null;
};

type SetRow = {
  id: string;
  name: string;
  tag: string;
  description: string;
  images: string; // JSON string
};

type TierRow = { id: string; hours: number; price: number; original: number };
type CategoryRow = { id: string; key: string; label: string; tiers: TierRow[] };
type SettingsRow = {
  whatsappNumber: string;
  address: string;
  transferNumber: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  instagramPosts: string[];
};

type TeamRow = {
  id: string;
  name: string;
  username: string;
  isOwner: boolean;
  canBookings: boolean;
  canSets: boolean;
  canPricing: boolean;
  canTeam: boolean;
  canSettings: boolean;
};

type BlockedSlotRow = { id: string; date: string; setId: string | null; reason: string | null };

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending_deposit: { label: "مستني تحويل", cls: "text-neutral-500" },
  pending_verification: { label: "بانتظار المراجعة", cls: "text-orange-400" },
  confirmed: { label: "مؤكد", cls: "text-orange-500" },
};

export default function AdminDashboard({
  user,
  initialBookings,
  initialSets,
  initialCategories,
  initialTeam,
  initialBlockedSlots,
  initialSettings,
}: {
  user: SessionPayload;
  initialBookings: BookingRow[];
  initialSets: SetRow[];
  initialCategories: CategoryRow[];
  initialTeam: TeamRow[];
  initialBlockedSlots: BlockedSlotRow[];
  initialSettings: SettingsRow;
}) {
  const router = useRouter();
  const tabs = [
    { id: "bookings", label: "الحجوزات", show: user.canBookings },
    { id: "availability", label: "المواعيد", show: user.canBookings },
    { id: "waitlist", label: "قايمة الانتظار", show: user.canBookings },
    { id: "sets", label: "السيتات والصور", show: user.canSets },
    { id: "pricing", label: "الأسعار", show: user.canPricing },
    { id: "coupons", label: "الكوبونات", show: user.canPricing },
    { id: "team", label: "الفريق والصلاحيات", show: user.canTeam },
    { id: "settings", label: "الإعدادات العامة", show: user.canSettings },
  ].filter((t) => t.show);
  const [tab, setTab] = useState(tabs[0]?.id ?? "bookings");

  async function handleLogout() {
    await logout();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-4xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-neutral-400">
          مسجل دخول كـ <span className="text-orange-500">{user.name}</span>
        </p>
        <button onClick={handleLogout} className="text-xs text-neutral-500 hover:text-orange-500">
          تسجيل خروج
        </button>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              "rounded-sm border px-4 py-2 text-sm font-semibold " +
              (tab === t.id ? "border-orange-500 bg-orange-600 text-white" : "border-neutral-800 text-neutral-300 hover:border-neutral-600")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "bookings" && <BookingsTab bookings={initialBookings} />}
      {tab === "availability" && <AvailabilityTab blockedSlots={initialBlockedSlots} sets={initialSets} />}
      {tab === "waitlist" && <WaitlistTab sets={initialSets} />}
      {tab === "sets" && <SetsTab sets={initialSets} />}
      {tab === "pricing" && <PricingTab categories={initialCategories} />}
      {tab === "coupons" && <CouponsTab />}
      {tab === "team" && <TeamTab team={initialTeam} />}
      {tab === "settings" && <SettingsTab settings={initialSettings} />}
    </section>
  );
}

function BookingsTab({ bookings }: { bookings: BookingRow[] }) {
  const router = useRouter();
  const [lightbox, setLightbox] = useState<string | null>(null);

  async function confirm(id: string) {
    await confirmBooking(id);
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-black tracking-tight text-2xl text-neutral-50">كل الحجوزات ({bookings.length})</h1>
      <StatsSummary />
      <p className="mt-5 text-xs text-neutral-500">راجع صورة إثبات التحويل ثم اضغط "تأكيد" جنب الحجز.</p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-right text-neutral-500">
              <th className="py-2 pr-2">العميل</th>
              <th className="py-2 pr-2">السيت</th>
              <th className="py-2 pr-2">الباقة</th>
              <th className="py-2 pr-2">الميعاد</th>
              <th className="py-2 pr-2">الديبوزيت</th>
              <th className="py-2 pr-2">الإثبات</th>
              <th className="py-2 pr-2">الحالة</th>
              <th className="py-2 pr-2"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (
              <tr><td colSpan={8} className="py-8 text-center text-neutral-500">مفيش حجوزات لسه.</td></tr>
            )}
            {bookings.map((b) => {
              const st = STATUS_MAP[b.status] ?? STATUS_MAP.pending_deposit;
              return (
                <tr key={b.id} className="border-b border-neutral-900">
                  <td className="py-2 pr-2 text-neutral-200">
                    {b.customerName}
                    <div dir="ltr" className="font-mono text-[11px] text-neutral-500">{b.customerPhone}</div>
                  </td>
                  <td className="py-2 pr-2 text-neutral-400">{b.set.name}</td>
                  <td className="py-2 pr-2 text-neutral-400">{b.category.label} · {b.tierHours}س</td>
                  <td className="py-2 pr-2 font-mono text-xs text-neutral-400">{b.date.slice(0, 10)} — {b.startTime}</td>
                  <td className="py-2 pr-2">{formatEGP(b.depositAmount)}</td>
                  <td className="py-2 pr-2">
                    {b.paymentProofUrl ? (
                      <button onClick={() => setLightbox(b.paymentProofUrl)}>
                        <img src={b.paymentProofUrl} alt="إثبات" className="h-10 w-10 rounded-sm border border-neutral-800 object-cover hover:border-orange-500" />
                      </button>
                    ) : (
                      <span className="text-xs text-neutral-600">—</span>
                    )}
                  </td>
                  <td className={"py-2 pr-2 " + st.cls}>{st.label}</td>
                  <td className="py-2 pr-2">
                    {b.status !== "confirmed" && (
                      <button onClick={() => confirm(b.id)} className="rounded-sm border border-orange-500 px-2.5 py-1 text-xs text-orange-400 hover:bg-orange-600 hover:text-white">
                        تأكيد
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
        >
          <img src={lightbox} alt="إثبات التحويل" className="max-h-[85vh] max-w-full rounded-sm border border-neutral-700 object-contain" />
          <button onClick={() => setLightbox(null)} className="absolute left-6 top-6 text-2xl text-white hover:text-orange-500">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function AvailabilityTab({ blockedSlots, sets }: { blockedSlots: BlockedSlotRow[]; sets: SetRow[] }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [setId, setSetId] = useState(""); // فاضي = الاستوديو كله
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!date) return;
    setSaving(true);
    await addBlockedSlot({ date, setId: setId || null, reason: reason || undefined });
    setDate("");
    setReason("");
    setSaving(false);
    router.refresh();
  }

  async function handleRemove(id: string) {
    await removeBlockedSlot(id);
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-black tracking-tight text-2xl text-neutral-50">إدارة المواعيد</h1>
      <p className="mt-1 text-xs text-neutral-500">
        اقفل يوم إجازة أو صيانة — إما على كل السيتات، أو على سيت واحد بس.
      </p>

      <div className="card-frame mt-6 grid gap-3 p-4 sm:grid-cols-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-sm border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
        />
        <select
          value={setId}
          onChange={(e) => setSetId(e.target.value)}
          className="rounded-sm border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
        >
          <option value="">كل السيتات (الاستوديو كله)</option>
          {sets.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input
          placeholder="السبب (اختياري)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="rounded-sm border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
        />
        <button
          onClick={handleAdd}
          disabled={saving || !date}
          className="rounded-sm bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {saving ? "جاري القفل..." : "قفل اليوم ده"}
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {blockedSlots.length === 0 && (
          <p className="text-sm text-neutral-500">مفيش أيام مقفولة دلوقتي.</p>
        )}
        {blockedSlots.map((b) => {
          const setName = b.setId ? sets.find((s) => s.id === b.setId)?.name ?? "سيت محذوف" : "كل السيتات";
          return (
            <div key={b.id} className="flex items-center justify-between rounded-sm border border-neutral-800 bg-neutral-900 p-3 text-sm">
              <div>
                <span className="font-mono text-neutral-200">{b.date.slice(0, 10)}</span>
                <span className="mx-2 text-neutral-600">·</span>
                <span className="text-neutral-400">{setName}</span>
                {b.reason && <span className="mx-2 text-neutral-600">· {b.reason}</span>}
              </div>
              <button onClick={() => handleRemove(b.id)} className="text-xs text-neutral-500 hover:text-red-400">
                فتح اليوم ده ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SetsTab({ sets }: { sets: SetRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleAdd() {
    setBusy(true);
    await addSet();
    router.refresh();
    setBusy(false);
  }

  async function handleUpdate(id: string, field: "name" | "tag" | "description", value: string) {
    await updateSet(id, { [field]: value });
  }

  async function handleDelete(id: string) {
    setBusy(true);
    await deleteSet(id);
    router.refresh();
    setBusy(false);
  }

  async function handleAddImage(setId: string, file: File) {
    const dataUrl = await resizeToDataUrl(file, 900);
    await addSetImage(setId, dataUrl);
    router.refresh();
  }

  async function handleRemoveImage(setId: string, index: number) {
    await removeSetImage(setId, index);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-black tracking-tight text-xl text-neutral-50">السيتات والصور ({sets.length})</h2>
        <button onClick={handleAdd} disabled={busy} className="rounded-sm border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-400 hover:bg-orange-600 hover:text-white">
          + سيت جديد
        </button>
      </div>

      <div className="space-y-4">
        {sets.map((s) => {
          const images: string[] = JSON.parse(s.images || "[]");
          return (
            <div key={s.id} className="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
              <div className="mb-2 flex justify-end">
                <button onClick={() => handleDelete(s.id)} className="text-xs text-neutral-500 hover:text-red-400">
                  حذف السيت ✕
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <EditableField label="اسم السيت" initial={s.name} onSave={(v) => handleUpdate(s.id, "name", v)} />
                <EditableField label="التصنيف" initial={s.tag} onSave={(v) => handleUpdate(s.id, "tag", v)} />
              </div>
              <div className="mt-3">
                <EditableField label="الوصف" initial={s.description} onSave={(v) => handleUpdate(s.id, "description", v)} textarea />
              </div>
              <div className="mt-3">
                <label className="mb-2 block text-xs text-neutral-500">الصور ({images.length})</label>
                <div className="flex flex-wrap gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="h-20 w-20 rounded-sm border border-neutral-800 object-cover" />
                      <button onClick={() => handleRemoveImage(s.id, i)} className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                        ✕
                      </button>
                    </div>
                  ))}
                  <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-sm border border-dashed border-neutral-700 text-2xl text-neutral-500 hover:border-orange-500 hover:text-orange-500">
                    +
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleAddImage(s.id, e.target.files[0])} />
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EditableField({
  label,
  initial,
  onSave,
  textarea,
}: {
  label: string;
  initial: string;
  onSave: (v: string) => void;
  textarea?: boolean;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(false);

  function handleBlur() {
    if (value !== initial) {
      onSave(value);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  }

  const Comp = textarea ? "textarea" : "input";
  return (
    <div>
      <label className="mb-1 flex items-center gap-2 text-xs text-neutral-500">
        {label} {saved && <span className="text-orange-500">اتحفظ ✓</span>}
      </label>
      <Comp
        value={value}
        onChange={(e: any) => setValue(e.target.value)}
        onBlur={handleBlur}
        rows={textarea ? 2 : undefined}
        className="w-full rounded-sm border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
      />
    </div>
  );
}

function PricingTab({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [newLabel, setNewLabel] = useState("");
  const [newIncludes, setNewIncludes] = useState("");
  const [addingCat, setAddingCat] = useState(false);

  async function handleUpdate(tierId: string, price: number, original: number) {
    await updateTier(tierId, price, original);
    router.refresh();
  }

  async function handleAddCategory() {
    if (!newLabel.trim()) return;
    setAddingCat(true);
    const includes = newIncludes.split("،").map((s) => s.trim()).filter(Boolean);
    await addCategory({ label: newLabel.trim(), includes });
    setNewLabel("");
    setNewIncludes("");
    setAddingCat(false);
    router.refresh();
  }

  async function handleDeleteCategory(id: string) {
    await deleteCategory(id);
    router.refresh();
  }

  async function handleDeleteTier(tierId: string) {
    await deleteTier(tierId);
    router.refresh();
  }

  return (
    <div>
      <h2 className="mb-4 font-black tracking-tight text-xl text-neutral-50">الأسعار</h2>
      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-50">{cat.label}</h3>
              <button onClick={() => handleDeleteCategory(cat.id)} className="text-xs text-neutral-500 hover:text-red-400">
                حذف الفئة ✕
              </button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {cat.tiers.map((tier) => (
                <TierEditor key={tier.id} tier={tier} onSave={handleUpdate} onDelete={handleDeleteTier} />
              ))}
              <AddTierForm categoryId={cat.id} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-sm border border-dashed border-neutral-700 p-4">
        <p className="mb-3 font-semibold text-neutral-50">إضافة فئة جديدة (مثلاً: فوتوغرافي)</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="اسم الفئة"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="rounded-sm border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
          />
          <input
            placeholder="المعدات المتضمنة، افصل بينهم بفاصلة عربي (،)"
            value={newIncludes}
            onChange={(e) => setNewIncludes(e.target.value)}
            className="rounded-sm border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
          />
        </div>
        <button
          onClick={handleAddCategory}
          disabled={addingCat || !newLabel.trim()}
          className="mt-3 rounded-sm bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {addingCat ? "جاري الإضافة..." : "إضافة الفئة"}
        </button>
        <p className="mt-2 text-[11px] text-neutral-500">
          بعد إضافة الفئة، هتقدر تضيفلها مدد وأسعار من جوه الكارت اللي هيظهر فوق.
        </p>
      </div>
    </div>
  );
}

function AddTierForm({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const [hours, setHours] = useState("");
  const [price, setPrice] = useState("");
  const [original, setOriginal] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    const h = Number(hours);
    const p = Number(price);
    const o = Number(original);
    if (!h || !p || !o) return;
    setSaving(true);
    await addTier(categoryId, h, p, o);
    setHours("");
    setPrice("");
    setOriginal("");
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="rounded-sm border border-dashed border-neutral-700 p-3">
      <p className="mb-2 font-mono text-xs text-neutral-500">إضافة مدة جديدة</p>
      <input
        type="number"
        placeholder="عدد الساعات"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        className="w-full rounded-sm border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-100"
      />
      <input
        type="number"
        placeholder="السعر بعد الخصم"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="mt-2 w-full rounded-sm border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-100"
      />
      <input
        type="number"
        placeholder="السعر الأصلي"
        value={original}
        onChange={(e) => setOriginal(e.target.value)}
        className="mt-2 w-full rounded-sm border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-100"
      />
      <button
        onClick={handleAdd}
        disabled={saving}
        className="mt-2 w-full rounded-sm border border-orange-500 py-1.5 text-xs font-semibold text-orange-400 hover:bg-orange-600 hover:text-white disabled:opacity-40"
      >
        + إضافة
      </button>
    </div>
  );
}

function TierEditor({
  tier,
  onSave,
  onDelete,
}: {
  tier: TierRow;
  onSave: (id: string, price: number, original: number) => void;
  onDelete: (id: string) => void;
}) {
  const [price, setPrice] = useState(tier.price);
  const [original, setOriginal] = useState(tier.original);

  return (
    <div className="rounded-sm border border-neutral-800 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-xs text-neutral-500">{tier.hours} {hoursLabel(tier.hours)}</p>
        <button onClick={() => onDelete(tier.id)} className="text-[11px] text-neutral-600 hover:text-red-400">
          ✕
        </button>
      </div>
      <label className="mb-1 block text-[11px] text-neutral-500">السعر بعد الخصم</label>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        onBlur={() => onSave(tier.id, price, original)}
        className="w-full rounded-sm border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-100"
      />
      <label className="mb-1 mt-2 block text-[11px] text-neutral-500">السعر الأصلي</label>
      <input
        type="number"
        value={original}
        onChange={(e) => setOriginal(Number(e.target.value))}
        onBlur={() => onSave(tier.id, price, original)}
        className="w-full rounded-sm border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-100"
      />
      <p className="mt-2 font-mono text-[11px] text-orange-500">ديبوزيت متوقع: {formatEGP(depositFor(price))}</p>
    </div>
  );
}

const PERMISSION_LABELS: Record<string, string> = {
  canBookings: "متابعة الحجوزات",
  canSets: "تعديل السيتات والصور",
  canPricing: "تعديل الأسعار",
  canTeam: "إدارة الفريق (صلاحية حساسة)",
  canSettings: "تعديل الإعدادات العامة",
};

function TeamTab({ team }: { team: TeamRow[] }) {
  const router = useRouter();
  const [newMember, setNewMember] = useState({
    name: "",
    username: "",
    password: "",
    canBookings: true,
    canSets: false,
    canPricing: false,
    canTeam: false,
    canSettings: false,
  });

  async function handleToggle(id: string, key: "canBookings" | "canSets" | "canPricing" | "canTeam" | "canSettings", value: boolean) {
    await toggleTeamPermission(id, key, value);
    router.refresh();
  }

  async function handleRemove(id: string) {
    await removeTeamMember(id);
    router.refresh();
  }

  async function handleAdd() {
    if (!newMember.name || !newMember.username || !newMember.password) return;
    await addTeamMember(newMember);
    setNewMember({ name: "", username: "", password: "", canBookings: true, canSets: false, canPricing: false, canTeam: false, canSettings: false });
    router.refresh();
  }

  return (
    <div>
      <h2 className="mb-4 font-black tracking-tight text-xl text-neutral-50">الفريق والصلاحيات</h2>

      <div className="space-y-3">
        {team.map((m) => (
          <div key={m.id} className="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-neutral-50">{m.name} {m.isOwner && <span className="text-xs text-orange-500">(أساسي)</span>}</p>
                <p dir="ltr" className="font-mono text-xs text-neutral-500">{m.username}</p>
              </div>
              {!m.isOwner && (
                <button onClick={() => handleRemove(m.id)} className="text-xs text-neutral-500 hover:text-red-400">
                  حذف ✕
                </button>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {(["canBookings", "canSets", "canPricing", "canTeam", "canSettings"] as const).map((key) => (
                <label key={key} className="flex items-center gap-2 text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={m[key]}
                    disabled={m.isOwner}
                    onChange={(e) => handleToggle(m.id, key, e.target.checked)}
                  />
                  {PERMISSION_LABELS[key]}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-sm border border-dashed border-neutral-700 p-4">
        <p className="mb-3 font-semibold text-neutral-50">إضافة مدير/موديريتور جديد</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <input placeholder="الاسم" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} className="rounded-sm border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100" />
          <input placeholder="اسم المستخدم" dir="ltr" value={newMember.username} onChange={(e) => setNewMember({ ...newMember, username: e.target.value })} className="rounded-sm border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100" />
          <input placeholder="كلمة السر" dir="ltr" value={newMember.password} onChange={(e) => setNewMember({ ...newMember, password: e.target.value })} className="rounded-sm border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100" />
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {(["canBookings", "canSets", "canPricing", "canTeam", "canSettings"] as const).map((key) => (
            <label key={key} className="flex items-center gap-2 text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={newMember[key]}
                onChange={(e) => setNewMember({ ...newMember, [key]: e.target.checked })}
              />
              {PERMISSION_LABELS[key]}
            </label>
          ))}
        </div>
        <button onClick={handleAdd} className="mt-4 rounded-sm bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500">
          إضافة العضو
        </button>
      </div>
    </div>
  );
}

function resizeToDataUrl(file: File, maxWidth: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function SettingsTab({ settings }: { settings: SettingsRow }) {
  const router = useRouter();
  const [draft, setDraft] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [newPostUrl, setNewPostUrl] = useState("");

  async function handleSave() {
    setSaving(true);
    await updateSettings({
      whatsappNumber: draft.whatsappNumber,
      address: draft.address,
      transferNumber: draft.transferNumber,
      instagramUrl: draft.instagramUrl || null,
      facebookUrl: draft.facebookUrl || null,
      tiktokUrl: draft.tiktokUrl || null,
    });
    setSaving(false);
    setSavedMsg("اتحفظ ✓");
    setTimeout(() => setSavedMsg(""), 2000);
    router.refresh();
  }

  async function handleAddPost() {
    if (!newPostUrl.trim()) return;
    const next = [...draft.instagramPosts, newPostUrl.trim()];
    setDraft({ ...draft, instagramPosts: next });
    setNewPostUrl("");
    await updateInstagramPosts(next);
    router.refresh();
  }

  async function handleRemovePost(url: string) {
    const next = draft.instagramPosts.filter((p) => p !== url);
    setDraft({ ...draft, instagramPosts: next });
    await updateInstagramPosts(next);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-black tracking-tight text-xl text-neutral-50">الإعدادات العامة</h2>
        <button onClick={handleSave} disabled={saving} className="rounded-sm bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-50">
          {saving ? "جاري الحفظ..." : "حفظ التعديلات"} {savedMsg}
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-1 block text-xs text-neutral-500">رقم الواتساب (بيظهر للعملاء، بالشكل 01xxxxxxxxx)</label>
          <input
            dir="ltr"
            value={draft.whatsappNumber}
            onChange={(e) => setDraft({ ...draft, whatsappNumber: e.target.value })}
            className="w-full rounded-sm border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">رقم التحويل (فودافون كاش / InstaPay)</label>
          <input
            dir="ltr"
            value={draft.transferNumber}
            onChange={(e) => setDraft({ ...draft, transferNumber: e.target.value })}
            className="w-full rounded-sm border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">العنوان</label>
          <input
            value={draft.address}
            onChange={(e) => setDraft({ ...draft, address: e.target.value })}
            className="w-full rounded-sm border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
          />
        </div>

        <div className="rounded-sm border border-dashed border-neutral-700 p-4">
          <p className="mb-3 font-semibold text-neutral-50">روابط السوشيال ميديا</p>
          <p className="mb-3 text-[11px] text-neutral-500">
            سيب أي حقل فاضي عشان الأيقونة بتاعته تختفي من الموقع تلقائيًا.
          </p>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-neutral-500">انستجرام</label>
              <input
                dir="ltr"
                placeholder="https://instagram.com/..."
                value={draft.instagramUrl ?? ""}
                onChange={(e) => setDraft({ ...draft, instagramUrl: e.target.value })}
                className="w-full rounded-sm border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">فيسبوك</label>
              <input
                dir="ltr"
                placeholder="https://facebook.com/..."
                value={draft.facebookUrl ?? ""}
                onChange={(e) => setDraft({ ...draft, facebookUrl: e.target.value })}
                className="w-full rounded-sm border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">تيك توك</label>
              <input
                dir="ltr"
                placeholder="https://tiktok.com/@..."
                value={draft.tiktokUrl ?? ""}
                onChange={(e) => setDraft({ ...draft, tiktokUrl: e.target.value })}
                className="w-full rounded-sm border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
              />
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-dashed border-neutral-700 p-4">
          <p className="mb-3 font-semibold text-neutral-50">بوستات انستجرام مختارة للعرض في الموقع</p>
          <p className="mb-3 text-[11px] text-neutral-500">
            انسخ لينك أي بوست من انستجرام (Copy Link) والصقه هنا.
          </p>
          <div className="mb-3 flex gap-2">
            <input
              dir="ltr"
              placeholder="https://www.instagram.com/p/..."
              value={newPostUrl}
              onChange={(e) => setNewPostUrl(e.target.value)}
              className="flex-1 rounded-sm border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
            />
            <button onClick={handleAddPost} className="rounded-sm border border-orange-500 px-4 py-2 text-xs font-semibold text-orange-400 hover:bg-orange-600 hover:text-white">
              + إضافة
            </button>
          </div>
          <div className="space-y-2">
            {draft.instagramPosts.map((url) => (
              <div key={url} className="flex items-center justify-between rounded-sm border border-neutral-800 p-2 text-xs">
                <span dir="ltr" className="truncate text-neutral-400">{url}</span>
                <button onClick={() => handleRemovePost(url)} className="text-neutral-500 hover:text-red-400">✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsSummary() {
  const [stats, setStats] = useState<{
    totalRevenue: number;
    totalBookings: number;
    topSetName: string;
    topSetCount: number;
    topCategoryName: string;
    topCategoryCount: number;
  } | null>(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-4">
      <div className="rounded-sm border border-neutral-800 bg-neutral-900 p-3">
        <p className="font-mono text-[11px] text-neutral-500">إجمالي الإيرادات (المؤكدة)</p>
        <p className="mt-1 font-black text-lg text-orange-500">{formatEGP(stats.totalRevenue)}</p>
      </div>
      <div className="rounded-sm border border-neutral-800 bg-neutral-900 p-3">
        <p className="font-mono text-[11px] text-neutral-500">عدد الحجوزات</p>
        <p className="mt-1 font-black text-lg text-neutral-50">{stats.totalBookings}</p>
      </div>
      <div className="rounded-sm border border-neutral-800 bg-neutral-900 p-3">
        <p className="font-mono text-[11px] text-neutral-500">أكتر سيت مطلوب</p>
        <p className="mt-1 text-sm text-neutral-200">{stats.topSetName} ({stats.topSetCount})</p>
      </div>
      <div className="rounded-sm border border-neutral-800 bg-neutral-900 p-3">
        <p className="font-mono text-[11px] text-neutral-500">أكتر فئة مطلوبة</p>
        <p className="mt-1 text-sm text-neutral-200">{stats.topCategoryName} ({stats.topCategoryCount})</p>
      </div>
    </div>
  );
}

type CouponRow = {
  id: string;
  code: string;
  type: string;
  value: number;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
};

function CouponsTab() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: "", type: "percent" as "percent" | "fixed", value: "", usageLimit: "", expiresAt: "" });

  function refresh() {
    getCoupons().then((data) => {
      setCoupons(data as unknown as CouponRow[]);
      setLoading(false);
    });
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAdd() {
    if (!form.code.trim() || !form.value) return;
    await addCoupon({
      code: form.code,
      type: form.type,
      value: Number(form.value),
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      expiresAt: form.expiresAt || null,
    });
    setForm({ code: "", type: "percent", value: "", usageLimit: "", expiresAt: "" });
    refresh();
  }

  async function handleToggle(id: string, isActive: boolean) {
    await toggleCoupon(id, isActive);
    refresh();
  }

  async function handleDelete(id: string) {
    await deleteCoupon(id);
    refresh();
  }

  return (
    <div>
      <h2 className="mb-4 font-black tracking-tight text-xl text-neutral-50">الكوبونات</h2>

      {loading ? (
        <p className="text-sm text-neutral-500">جاري التحميل...</p>
      ) : (
        <div className="space-y-2">
          {coupons.length === 0 && <p className="text-sm text-neutral-500">مفيش كوبونات لسه.</p>}
          {coupons.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-sm border border-neutral-800 bg-neutral-900 p-3 text-sm">
              <div>
                <span dir="ltr" className="font-mono font-semibold text-neutral-100">{c.code}</span>
                <span className="mx-2 text-neutral-600">·</span>
                <span className="text-neutral-400">
                  {c.type === "percent" ? `${c.value}%` : formatEGP(c.value)} خصم
                </span>
                <span className="mx-2 text-neutral-600">·</span>
                <span className="text-neutral-500">استخدم {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-xs text-neutral-400">
                  <input type="checkbox" checked={c.isActive} onChange={(e) => handleToggle(c.id, e.target.checked)} />
                  فعّال
                </label>
                <button onClick={() => handleDelete(c.id)} className="text-xs text-neutral-500 hover:text-red-400">
                  حذف ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-sm border border-dashed border-neutral-700 p-4">
        <p className="mb-3 font-semibold text-neutral-50">إضافة كوبون جديد</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="الكود (مثلاً VOCK20)"
            dir="ltr"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="rounded-sm border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as "percent" | "fixed" })}
            className="rounded-sm border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
          >
            <option value="percent">نسبة مئوية %</option>
            <option value="fixed">مبلغ ثابت (جنيه)</option>
          </select>
          <input
            type="number"
            placeholder={form.type === "percent" ? "قيمة الخصم %" : "قيمة الخصم بالجنيه"}
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            className="rounded-sm border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
          />
          <input
            type="number"
            placeholder="حد الاستخدام (اختياري)"
            value={form.usageLimit}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            className="rounded-sm border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
          />
          <input
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            className="rounded-sm border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
          />
        </div>
        <button onClick={handleAdd} className="mt-3 rounded-sm bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500">
          إضافة الكوبون
        </button>
      </div>
    </div>
  );
}

type WaitlistRow = { id: string; date: string; setId: string; customerName: string; customerPhone: string };

function WaitlistTab({ sets }: { sets: SetRow[] }) {
  const [entries, setEntries] = useState<WaitlistRow[]>([]);
  const [loading, setLoading] = useState(true);

  function refresh() {
    getWaitlist().then((data) => {
      setEntries(data as unknown as WaitlistRow[]);
      setLoading(false);
    });
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleRemove(id: string) {
    await removeWaitlistEntry(id);
    refresh();
  }

  return (
    <div>
      <h2 className="mb-1 font-black tracking-tight text-xl text-neutral-50">قايمة الانتظار</h2>
      <p className="mb-4 text-xs text-neutral-500">عملاء مهتمين بمواعيد كانت محجوزة بالكامل. كلّمهم واتساب لو فضى ميعاد.</p>
      {loading ? (
        <p className="text-sm text-neutral-500">جاري التحميل...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-neutral-500">مفيش حد مسجل دلوقتي.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => {
            const setName = sets.find((s) => s.id === e.setId)?.name ?? "سيت محذوف";
            return (
              <div key={e.id} className="flex items-center justify-between rounded-sm border border-neutral-800 bg-neutral-900 p-3 text-sm">
                <div>
                  <span className="text-neutral-200">{e.customerName}</span>
                  <span className="mx-2 text-neutral-600">·</span>
                  <span dir="ltr" className="font-mono text-neutral-400">{e.customerPhone}</span>
                  <span className="mx-2 text-neutral-600">·</span>
                  <span className="text-neutral-400">{setName}</span>
                  <span className="mx-2 text-neutral-600">·</span>
                  <span className="font-mono text-xs text-neutral-500">{e.date.slice(0, 10)}</span>
                </div>
                <button onClick={() => handleRemove(e.id)} className="text-xs text-neutral-500 hover:text-red-400">
                  إزالة ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
