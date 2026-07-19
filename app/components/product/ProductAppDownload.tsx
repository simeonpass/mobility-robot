import {ExternalLink} from 'lucide-react';
import {XSTO_APP} from '~/lib/xsto-app';

export function ProductAppDownload() {
  return (
    <section
      aria-labelledby="product-app-download-heading"
      className="border-t border-border/40 bg-gradient-to-b from-background to-cream/40 pb-12 pt-14 md:pb-16 md:pt-20"
    >
      <div className="xsto-container">
        <div className="grid items-end gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <h2
              className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl"
              id="product-app-download-heading"
            >
              {XSTO_APP.headline}
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              {XSTO_APP.support}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-8 lg:justify-start">
              <QrBlock
                label={XSTO_APP.ios.qrLabel}
                src={XSTO_APP.ios.qrSrc}
              />
              <QrBlock
                label={XSTO_APP.android.qrLabel}
                src={XSTO_APP.android.qrSrc}
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:justify-start">
              <StoreTextLink
                href={XSTO_APP.ios.href}
                label={XSTO_APP.ios.shortLabel}
              />
              <StoreTextLink
                href={XSTO_APP.android.href}
                label={XSTO_APP.android.shortLabel}
              />
            </div>
          </div>

          <div className="mb-0 flex justify-center lg:justify-end">
            <img
              alt={XSTO_APP.phone.alt}
              className="h-auto w-full max-w-[260px] object-contain drop-shadow-2xl md:max-w-[320px]"
              height={645}
              loading="lazy"
              src={XSTO_APP.phone.src}
              width={435}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function QrBlock({src, label}: {src: string; label: string}) {
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-xl border border-border/60 bg-background p-3 shadow-medium">
        <img
          alt={label}
          className="size-32 object-contain md:size-36"
          height={140}
          loading="lazy"
          src={src}
          width={140}
        />
      </div>
      <span className="mt-3 text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

function StoreTextLink({href, label}: {href: string; label: string}) {
  return (
    <a
      className="inline-flex items-center gap-2 font-semibold text-xsto-blue no-underline hover:underline"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
      <ExternalLink aria-hidden className="size-4" />
    </a>
  );
}
