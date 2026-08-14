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
      <span className="inline-flex size-6 items-center justify-center text-primary">
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
        <div className="mb-6 max-w-2xl md:mb-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-navy md:text-3xl">
            Compare the range
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            Side-by-side features across M4, M4B, M4 Pro, X12 and X12 Pro.
          </p>
        </div>

        <div className="overflow-x-auto border-y border-border bg-background md:border md:rounded-xl">
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
                      className="hover:text-primary"
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
