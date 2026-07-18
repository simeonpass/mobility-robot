import {useId, useState} from 'react';
import {Link} from 'react-router';
import {Check} from 'lucide-react';
import {ProductVideoPlayer} from '~/components/product/ProductVideoPlayer';
import {isXstoRangeProduct, type ProductContent} from '~/lib/product-specs';

type ProductSpecTabsProps = {
  content: ProductContent;
  shopifyHandle: string;
};

const TAB_ORDER = [
  {id: 'overview', label: 'Description'},
  {id: 'specifications', label: 'Specifications'},
  {id: 'included', label: 'In the Box'},
  {id: 'downloads', label: 'Downloads'},
  {id: 'delivery', label: 'Shipping & Returns'},
  {id: 'faq', label: 'FAQ'},
  {id: 'videos', label: 'Videos'},
] as const;

type TabId = (typeof TAB_ORDER)[number]['id'];

export function ProductSpecTabs({content, shopifyHandle}: ProductSpecTabsProps) {
  const baseId = useId();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const showAllTabs = isXstoRangeProduct(shopifyHandle);

  const visibleTabs = TAB_ORDER.filter((tab) => {
    if (tab.id === 'downloads') {
      return (content.downloads?.length ?? 0) > 0;
    }

    if (showAllTabs) return true;

    switch (tab.id) {
      case 'overview':
        return Boolean(
          content.overview ||
            content.highlights.length > 0 ||
            (content.features?.length ?? 0) > 0,
        );
      case 'specifications':
        return content.specs.length > 0 || content.dimensions.length > 0;
      case 'included':
        return content.inBox.length > 0;
      case 'delivery':
        return Boolean(content.deliveryWarranty);
      case 'faq':
        return content.faqs.length > 0;
      case 'videos':
        return content.videos.length > 0;
      default:
        return false;
    }
  });

  if (visibleTabs.length === 0) return null;

  const active = visibleTabs.some((tab) => tab.id === activeTab)
    ? activeTab
    : visibleTabs[0].id;

  return (
    <section aria-labelledby={`${baseId}-heading`} className="mt-10 md:mt-12">
      <h2 className="sr-only" id={`${baseId}-heading`}>
        Product details
      </h2>

      <div
        aria-label="Product information"
        className="flex gap-1 overflow-x-auto border-b border-border"
        role="tablist"
      >
        {visibleTabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              aria-controls={`${baseId}-panel-${tab.id}`}
              aria-selected={selected}
              className={[
                'shrink-0 border-b-2 px-3 py-3 text-[0.8125rem] font-semibold tracking-[-0.01em] transition-colors sm:px-3.5 sm:py-2.5',
                selected
                  ? 'border-navy text-navy'
                  : 'border-transparent text-slate hover:text-navy',
              ].join(' ')}
              id={`${baseId}-tab-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="py-6 md:py-8">
        {active === 'overview' ? (
          <TabPanel id={`${baseId}-panel-overview`} labelledBy={`${baseId}-tab-overview`}>
            {content.overview ? (
              <p className="max-w-3xl text-base leading-relaxed text-foreground md:text-lg">
                {content.overview}
              </p>
            ) : null}

            {content.features && content.features.length > 0 ? (
              <div className="mt-10 grid gap-6 md:grid-cols-2">
                {content.features.map((feature) => (
                  <article
                    className="rounded-2xl border border-border bg-card p-5 shadow-soft"
                    key={feature.title}
                  >
                    <h3 className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {feature.highlights.map((item) => (
                        <li
                          className="flex items-start gap-2 text-sm text-foreground"
                          key={item}
                        >
                          <Check
                            aria-hidden
                            className="mt-0.5 size-4 shrink-0 text-gold"
                            strokeWidth={2.5}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            ) : content.highlights.length > 0 ? (
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {content.highlights.map((item) => (
                  <li
                    className="flex items-start gap-2 text-foreground"
                    key={item}
                  >
                    <Check
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0 text-gold"
                      strokeWidth={2.5}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}

            {isXstoRangeProduct(shopifyHandle) ? (
              <p className="mt-10 text-sm text-muted-foreground">
                Compare all models on our{' '}
                <Link className="font-semibold text-gold hover:underline" to="/#product-range">
                  homepage comparison table
                </Link>
                .
              </p>
            ) : null}
          </TabPanel>
        ) : null}

        {active === 'specifications' ? (
          <TabPanel
            id={`${baseId}-panel-specifications`}
            labelledBy={`${baseId}-tab-specifications`}
          >
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.specs.map((spec) => (
                <div
                  className="rounded-xl border border-border bg-card p-4"
                  key={spec.label}
                >
                  <dt className="text-sm font-medium text-muted-foreground">
                    {spec.label}
                  </dt>
                  <dd className="mt-1 text-base font-medium text-foreground">
                    {spec.value}
                    {spec.unit ? (
                      <span className="font-normal text-muted-foreground">
                        {' '}
                        {spec.unit}
                      </span>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>

            {content.dimensions.length > 0 ? (
              <div className="mt-10">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Dimensions
                </h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                  {content.dimensions.map((dim) => (
                    <div
                      className="rounded-xl border border-border bg-card p-4"
                      key={dim.label}
                    >
                      <dt className="text-sm font-medium text-muted-foreground">
                        {dim.label}
                      </dt>
                      <dd className="mt-1 font-medium text-foreground">
                        {dim.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </TabPanel>
        ) : null}

        {active === 'included' ? (
          <TabPanel id={`${baseId}-panel-included`} labelledBy={`${baseId}-tab-included`}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {content.inBox.map((item) => (
                <li
                  className="flex items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-foreground"
                  key={item}
                >
                  <Check
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-gold"
                    strokeWidth={2.5}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </TabPanel>
        ) : null}

        {active === 'downloads' && content.downloads?.length ? (
          <TabPanel
            id={`${baseId}-panel-downloads`}
            labelledBy={`${baseId}-tab-downloads`}
          >
            <ul className="grid gap-3 sm:grid-cols-2">
              {content.downloads.map((file) => (
                <li key={file.href}>
                  <a
                    className="group flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-4 transition-colors hover:border-navy/30 hover:bg-navy/[0.02]"
                    download
                    href={file.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span
                      aria-hidden
                      className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy text-[0.65rem] font-bold tracking-wide text-white"
                    >
                      PDF
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-navy group-hover:underline">
                        {file.title}
                      </span>
                      {file.description ? (
                        <span className="mt-1 block text-xs leading-relaxed text-slate">
                          {file.description}
                        </span>
                      ) : null}
                      <span className="mt-2 inline-block text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                        Download
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </TabPanel>
        ) : null}

        {active === 'delivery' ? (
          <TabPanel id={`${baseId}-panel-delivery`} labelledBy={`${baseId}-tab-delivery`}>
            <div className="max-w-3xl space-y-4 text-base leading-relaxed text-foreground">
              {content.deliveryWarranty.split('\n\n').map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
            <p className="mt-6 text-sm">
              <Link className="font-semibold text-gold hover:underline" to="/returns">
                Read our returns policy
              </Link>
              {' · '}
              <Link className="font-semibold text-gold hover:underline" to="/warranty">
                Warranty information
              </Link>
            </p>
          </TabPanel>
        ) : null}

        {active === 'faq' ? (
          <TabPanel id={`${baseId}-panel-faq`} labelledBy={`${baseId}-tab-faq`}>
            <div className="divide-y divide-border rounded-2xl border border-border bg-card shadow-soft">
              {content.faqs.map((faq) => (
                <details className="group px-5 py-4 md:px-6" key={faq.question}>
                  <summary className="cursor-pointer list-none font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {faq.question}
                      <span
                        aria-hidden
                        className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-gold transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-3 pb-1 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </TabPanel>
        ) : null}

        {active === 'videos' ? (
          <TabPanel id={`${baseId}-panel-videos`} labelledBy={`${baseId}-tab-videos`}>
            <div className="grid gap-6 md:grid-cols-2">
              {content.videos.map((video) => (
                <div className="space-y-3" key={video.embedUrl}>
                  <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-secondary shadow-soft">
                    <ProductVideoPlayer
                      className="size-full border-0 object-contain"
                      src={video.embedUrl}
                      title={video.title}
                    />
                  </div>
                  <p className="font-medium text-foreground">{video.title}</p>
                </div>
              ))}
            </div>
          </TabPanel>
        ) : null}
      </div>
    </section>
  );
}

function TabPanel({
  id,
  labelledBy,
  children,
}: {
  id: string;
  labelledBy: string;
  children: React.ReactNode;
}) {
  return (
    <div aria-labelledby={labelledBy} id={id} role="tabpanel">
      {children}
    </div>
  );
}
