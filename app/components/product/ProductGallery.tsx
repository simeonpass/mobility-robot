import {useCallback, useEffect, useId, useState} from 'react';
import {AnimatePresence, motion, useReducedMotion} from 'framer-motion';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {Image} from '@shopify/hydrogen';
import type {GalleryMediaItem} from '~/lib/product-gallery';

type ProductGalleryProps = {
  items: GalleryMediaItem[];
  productTitle: string;
};

export function ProductGallery({items, productTitle}: ProductGalleryProps) {
  const groupId = useId();
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] ?? items[0];

  const selectItem = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((current) => (current <= 0 ? items.length - 1 : current - 1));
  }, [items.length]);

  const goNext = useCallback(() => {
    setActiveIndex((current) => (current >= items.length - 1 ? 0 : current + 1));
  }, [items.length]);

  useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, items.length]);

  if (!activeItem) {
    return <div className="aspect-square w-full rounded-lg bg-secondary/60" />;
  }

  const thumbList =
    items.length > 1 ? (
      <ul
        aria-label="Product thumbnails"
        className="scrollbar-hide flex gap-2 overflow-x-auto pb-1 lg:max-h-[min(640px,72vh)] lg:w-[4.5rem] lg:shrink-0 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0"
        role="listbox"
      >
        {items.map((item, index) => {
          const selected = index === activeIndex;
          const thumbUrl = item.type === 'image' ? item.url : item.thumbnailUrl;
          const label =
            item.type === 'video'
              ? `Play ${item.title}`
              : `Show image ${index + 1} of ${items.length}`;

          return (
            <li className="shrink-0" key={item.id} role="presentation">
              <button
                aria-controls={`${groupId}-main-media`}
                aria-label={label}
                aria-selected={selected}
                className={[
                  'relative size-[4.25rem] shrink-0 overflow-hidden rounded-md border transition-all sm:size-[4.75rem]',
                  selected
                    ? 'border-foreground ring-1 ring-foreground/20'
                    : 'border-border/80 opacity-70 hover:border-foreground/30 hover:opacity-100',
                ].join(' ')}
                onClick={() => selectItem(index)}
                role="option"
                type="button"
              >
                {thumbUrl ? (
                  <img
                    alt=""
                    className="size-full object-cover"
                    height={76}
                    loading="lazy"
                    src={thumbUrl}
                    width={76}
                  />
                ) : (
                  <span className="flex size-full items-center justify-center bg-secondary text-xs text-muted-foreground">
                    Video
                  </span>
                )}
                {item.type === 'video' ? (
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center bg-navy/35"
                  >
                    <span className="flex size-6 items-center justify-center rounded-full bg-background/95 text-navy">
                      ▶
                    </span>
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    ) : null;

  return (
    <div className="min-w-0 lg:flex lg:gap-3">
      {thumbList ? <div className="order-2 mt-3 lg:order-1 lg:mt-0">{thumbList}</div> : null}

      <div
        aria-label={`${productTitle} gallery`}
        aria-roledescription="carousel"
        className="relative order-1 min-w-0 flex-1"
        id={`${groupId}-main-media`}
        role="region"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-secondary/40">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              animate={{opacity: 1}}
              className="absolute inset-0"
              exit={{opacity: 0}}
              initial={reducedMotion ? false : {opacity: 0}}
              key={activeItem.id}
              transition={{duration: reducedMotion ? 0 : 0.2}}
            >
              {activeItem.type === 'image' ? (
                <div className="flex size-full items-center justify-center p-5 md:p-10">
                  <Image
                    alt={activeItem.altText || productTitle}
                    className="max-h-full max-w-full object-contain"
                    data={activeItem}
                    sizes="(min-width: 1024px) 58vw, 100vw"
                  />
                </div>
              ) : (
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="size-full border-0"
                  src={activeItem.embedUrl}
                  title={activeItem.title}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {items.length > 1 ? (
            <>
              <button
                aria-label="Previous image"
                className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground shadow-soft backdrop-blur-sm transition-colors hover:bg-background"
                onClick={goPrev}
                type="button"
              >
                <ChevronLeft aria-hidden className="size-4" strokeWidth={1.75} />
              </button>
              <button
                aria-label="Next image"
                className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground shadow-soft backdrop-blur-sm transition-colors hover:bg-background"
                onClick={goNext}
                type="button"
              >
                <ChevronRight aria-hidden className="size-4" strokeWidth={1.75} />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
