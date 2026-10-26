import { BadgeCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { NewsletterForm } from "../common/NewsletterForm";
import { useStoreSettings } from "../common/useStoreSettings";
import { useStoreSettings as useSettingsWithDefaults } from "../product/useStoreSettings";
import { formatTk } from "../../../lib/format";
import { CONTAINER, Section } from "./shared";

export function NewsletterBlock() {
  return (
    <Section>
      <div className="grid items-center gap-6 rounded-lg bg-accent px-6 py-10 text-accent-foreground md:grid-cols-2 md:px-12">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent-foreground/75">Newsletter</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">New arrivals, once a week.</h2>
          <p className="mt-2 text-accent-foreground/85">Reading lists, author news and members-only offers. Unsubscribe any time.</p>
        </div>
        <NewsletterForm inverted />
      </div>
    </Section>
  );
}

export function ServiceStrip() {
  const s = useSettingsWithDefaults();
  const freeShipping = s.freeShippingThreshold > 0;
  const features = [
    { Icon: Truck, title: "Nationwide delivery", body: s.deliveryEstimate },
    {
      Icon: BadgeCheck,
      title: freeShipping ? "Free shipping" : "Fair shipping",
      body: freeShipping ? `On orders over ${formatTk(s.freeShippingThreshold)}` : "Flat rates across Bangladesh",
    },
    { Icon: ShieldCheck, title: "Secure payment", body: "Cash on delivery, bKash, Nagad & cards" },
    { Icon: RotateCcw, title: "Easy returns", body: "Damaged or wrong book? We'll replace it" },
  ];
  return (
    <div className="border-y border-border bg-card">
      <div className={`${CONTAINER} grid grid-cols-2 divide-border py-6 lg:grid-cols-4 lg:divide-x`}>
        {features.map(({ Icon, title, body }) => (
          <div key={title} className="flex items-start gap-3 px-2 py-3 lg:px-6">
            <Icon size={22} className="mt-0.5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}