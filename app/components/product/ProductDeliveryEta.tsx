import {AlertTriangle, CalendarClock, Package, Truck} from 'lucide-react';
import type {DeliveryInfo} from '~/lib/product-delivery';

type ProductDeliveryEtaProps = {
  delivery: DeliveryInfo;
};

const STATUS_STYLES = {
  in_stock: {
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-500/20',
    icon: Truck,
    container: 'border-emerald-200/80 bg-emerald-50/60',
  },
  low_stock: {
    dot: 'bg-orange-500',
    ring: 'ring-orange-500/25',
    icon: AlertTriangle,
    container: 'border-orange-300/90 bg-orange-50/80',
  },
  preorder: {
    dot: 'bg-amber-500',
    ring: 'ring-amber-500/20',
    icon: CalendarClock,
    container: 'border-amber-200/90 bg-amber-50/80',
  },
  sold_out: {
    dot: 'bg-muted-foreground',
    ring: 'ring-muted/30',
    icon: Package,
    container: 'border-border bg-secondary/50',
  },
} as const;

export function ProductDeliveryEta({delivery}: ProductDeliveryEtaProps) {
  const styles = STATUS_STYLES[delivery.status];
  const Icon = styles.icon;
  const isPreorder = delivery.status === 'preorder';

  return (
    <div
      className={[
        'flex items-start gap-3 rounded-lg border px-3.5 py-3',
        styles.container,
      ].join(' ')}
    >
      <span
        aria-hidden
        className={[
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-2',
          styles.ring,
        ].join(' ')}
      >
        <Icon
          aria-hidden
          className="size-4 text-foreground"
          strokeWidth={1.75}
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span
            aria-hidden
            className={['size-1.5 shrink-0 rounded-full', styles.dot].join(' ')}
          />
          <p className="text-sm font-semibold text-navy">{delivery.headline}</p>
        </div>
        <p className="mt-1 text-sm leading-snug text-navy/80">
          {delivery.detail}
        </p>
        {delivery.instructions ? (
          <p className="mt-1.5 text-sm leading-relaxed text-navy/75">
            {delivery.instructions}
          </p>
        ) : null}
        <p
          className={[
            'font-medium text-navy',
            isPreorder ? 'mt-2 text-sm' : 'mt-1 text-[0.8125rem]',
          ].join(' ')}
        >
          {delivery.etaLabel}
        </p>
        {isPreorder ? (
          <ol className="mt-2.5 list-none space-y-1 border-t border-amber-300/50 pt-2.5 text-sm leading-snug text-navy/70">
            {delivery.preorderWeeks != null ? (
              <>
                <li>1. Place your order today to reserve your place.</li>
                <li>2. We build and fulfil it on the timescale above.</li>
                <li>3. Then we dispatch with free UK mainland delivery.</li>
              </>
            ) : (
              <>
                <li>1. Place your order today to reserve this item.</li>
                <li>2. We fulfil it as soon as stock arrives.</li>
                <li>3. Then we dispatch with free UK mainland delivery.</li>
              </>
            )}
          </ol>
        ) : null}
      </div>
    </div>
  );
}
