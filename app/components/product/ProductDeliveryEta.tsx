import {CalendarClock, Package, Truck} from 'lucide-react';
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
        'flex items-start gap-3 rounded-lg border px-4 py-3.5',
        styles.container,
      ].join(' ')}
    >
      <span
        aria-hidden
        className={[
          'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-background shadow-soft ring-4',
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
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            aria-hidden
            className={['size-2 shrink-0 rounded-full', styles.dot].join(' ')}
          />
          <p className="text-sm font-medium text-foreground">
            {delivery.headline}
          </p>
          <span className="hidden text-muted-foreground sm:inline">·</span>
          <p className="text-sm text-muted-foreground">{delivery.detail}</p>
        </div>
        <p className="mt-1 text-sm font-medium text-foreground">
          {delivery.etaLabel}
        </p>
      </div>
    </div>
  );
}
