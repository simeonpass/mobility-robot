import {useCallback, useEffect, useId, useState} from 'react';
import {AnimatePresence, motion, useReducedMotion} from 'framer-motion';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {Image} from '@shopify/hydrogen';
import {ProductVideoPlayer} from '~/components/product/ProductVideoPlayer';
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
        className="mr-product-thumbnails scrollbar-hide"
      >
        {items.map((item, index) => {
          const selected = index === activeIndex;
          const thumbUrl = item.type === 'image' ? item.url : item.thumbnailUrl;
          const label =
            item.type === 'video'
              ? `Play ${item.title}`
              : `Show image ${index + 1} of ${items.length}`;

          return (
            <li className="shrink-0" key={item.id}>
              <button
                aria-controls={`${groupId}-main-media`}
                aria-label={label}
                aria-pressed={selected}
                className={[
                  'mr-product-thumbnail relative shrink-0 overflow-hidden border transition-colors',
                  selected
                    ? 'is-selected'
                    : '',
                ].join(' ')}
                onClick={() => selectItem(index)}
                type="button"
              >
                {thumbUrl ? (
                  <Image
                    alt=""
                    className="size-full object-contain"
                    height={76}
                    loading="lazy"
                    src={thumbUrl}
                    sizes="76px"
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
    <div className="mr-product-gallery">

      <div
        aria-label={`${productTitle} gallery`}
        aria-roledescription="carousel"
        className="relative min-w-0"
        id={`${groupId}-main-media`}
        role="region"
      >
        <div className="mr-product-gallery-stage relative w-full overflow-hidden">
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
                <div className="mr-product-gallery-image flex size-full items-center justify-center">
                  <Image
                    alt={activeItem.altText || productTitle}
                    className="max-h-full max-w-full object-contain"
                    data={activeItem}
                    loading="eager"
                    fetchPriority="high"
                    sizes="(min-width: 1440px) 680px, (min-width: 1024px) 52vw, 100vw"
                  />
                </div>
              ) : (
                <ProductVideoPlayer
                  className="size-full border-0 object-contain"
                  src={activeItem.embedUrl}
                  title={activeItem.title}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {items.length > 1 ? (
            <>
              <button
                aria-label="Previous product image or video"
                className="mr-product-gallery-arrow absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground transition-colors hover:bg-background"
                onClick={goPrev}
                type="button"
              >
                <ChevronLeft aria-hidden className="size-4" strokeWidth={1.75} />
              </button>
              <button
                aria-label="Next product image or video"
                className="mr-product-gallery-arrow absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground transition-colors hover:bg-background"
                onClick={goNext}
                type="button"
              >
                <ChevronRight aria-hidden className="size-4" strokeWidth={1.75} />
              </button>
            </>
          ) : null}
        </div>
      </div>
      {thumbList}
    </div>
  );
}
