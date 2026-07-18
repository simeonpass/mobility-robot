import {Check} from 'lucide-react';
import {Link} from 'react-router';
import {
  HOMEPAGE_COMPARISON_FEATURES,
  HOMEPAGE_FLAGSHIP_HANDLES,
  HOMEPAGE_FLAGSHIP_LABELS,
  SHOPIFY_HOME_PRODUCT_HANDLES,
} from '~/lib/homepage-data';

function ComparisonCell({value}: {value: string | boolean}) {
  if (value === true) {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-gold/10 text-gold">
        <Check aria-hidden className="size-3.5" strokeWidth={2.5} />
      </span>
    );
  }

  if (value === false) {
    return <span className="text-muted-foreground/40">—</span>;
  }

  return <span className="font-medium text-foreground">{value}</span>;
}

export function ComparisonStrip() {
  return (
    <section className="border-y border-border bg-secondary/30 py-10 md:py-14">
      <div className="xsto-container">
        <div className="mb-6 flex flex-wrap gap-2 md:mb-8">
          {HOMEPAGE_FLAGSHIP_HANDLES.map((slot) => (
            <Link
              className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-gold hover:text-gold"
              key={slot}
              prefetch="intent"
              to={`/products/${SHOPIFY_HOME_PRODUCT_HANDLES[slot]}`}
            >
              {HOMEPAGE_FLAGSHIP_LABELS[slot]}
            </Link>
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-background shadow-soft">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-4 py-4 text-left font-semibold text-foreground md:px-6">
                  Feature
                </th>
                {HOMEPAGE_FLAGSHIP_HANDLES.map((slot) => (
                  <th
                    className="px-4 py-4 text-center font-semibold text-foreground md:px-6"
                    key={slot}
                  >
                    <Link
                      className="hover:text-gold"
                      prefetch="intent"
                      to={`/products/${SHOPIFY_HOME_PRODUCT_HANDLES[slot]}`}
                    >
                      {HOMEPAGE_FLAGSHIP_LABELS[slot]}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOMEPAGE_COMPARISON_FEATURES.map((row, rowIndex) => (
                <tr
                  className={
                    rowIndex % 2 === 0 ? 'bg-background' : 'bg-secondary/20'
                  }
                  key={row.label}
                >
                  <td className="px-4 py-3.5 font-medium text-foreground md:px-6">
                    {row.label}
                  </td>
                  {HOMEPAGE_FLAGSHIP_HANDLES.map((slot) => (
                    <td className="px-4 py-3.5 text-center md:px-6" key={slot}>
                      <ComparisonCell value={row.values[slot]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
