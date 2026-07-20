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
    container: 'border-amber-200/80 bg-amber-50/60',
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

  return (
    <div
      className={[
        'flex items-start gap-2.5 rounded-lg border px-3 py-2.5',
        styles.container,
      ].join(' ')}
    >
      <span
        aria-hidden
        className={[
          'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-background ring-2',
          styles.ring,
        ].join(' ')}
      >
        <Icon
          aria-hidden
          className="size-3.5 text-foreground"
          strokeWidth={1.75}
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span
            aria-hidden
            className={['size-1.5 shrink-0 rounded-full', styles.dot].join(' ')}
          />
          <p className="text-[0.8125rem] font-semibold text-navy">
            {delivery.headline}
          </p>
          <span className="hidden text-slate sm:inline">·</span>
          <p className="text-[0.8125rem] text-slate">{delivery.detail}</p>
        </div>
        <p className="mt-0.5 text-[0.8125rem] font-medium text-navy">
          {delivery.etaLabel}
        </p>
      </div>
    </div>
  );
}
