import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import {ArrowRight, ChevronLeft, ChevronRight, Pause, Play} from 'lucide-react';
import {useReducedMotion} from 'framer-motion';
import {Link} from 'react-router';
import type {HomeProduct} from '~/components/home/ProductRangeGrid';
import {
  HOMEPAGE_FLAGSHIP_LABELS,
  HOMEPAGE_PRODUCT_BADGES,
  HOMEPAGE_PRODUCT_THUMBS,
  isPausedFlagshipSlot,
  SHOPIFY_HOME_PRODUCT_HANDLES,
  type HomepageFlagshipHandle,
} from '~/lib/homepage-data';
import {catalogToExVatAmount, catalogToIncVatAmount} from '~/lib/pricing-mode';
import {getProductDisplayName} from '~/lib/product-content';
import {formatProductPrice} from '~/lib/product-pricing';
import {getProductListPrice} from '~/lib/product-vat-variants';
import m4ProCutout from '~/assets/hero/m4-pro-720.webp';
import m4bCutout from '~/assets/hero/m4b-720.webp';
import x12Cutout from '~/assets/hero/x12-720.webp';

/**
 * Homepage hero: the whole XSTO range on a slowly revolving showroom turntable.
 * One chair is held front and centre with its name, price and link beneath;
 * the ring advances on a timer, on the arrows, on the model strip, or by dragging.
 */

/** Order around the turntable; paused models (see PAUSED_FLAGSHIP_HANDLES) drop out. */
const HERO_ORDER = [
  'xsto-m4',
  'xsto-m4b',
  'xsto-m4-pro',
  'xsto-m8',
  'xsto-m8-pro',
  'xsto-x12',
  'xsto-x12-pro',
] as const satisfies readonly HomepageFlagshipHandle[];

const HERO_MODELS: readonly HomepageFlagshipHandle[] = HERO_ORDER.filter(
  (slot) => !isPausedFlagshipSlot(slot),
);

const COUNT_WORDS: Record<number, string> = {
  3: 'Three',
  4: 'Four',
  5: 'Five',
  6: 'Six',
  7: 'Seven',
};

const HERO_PITCH: Record<HomepageFlagshipHandle, string> = {
  'xsto-m8':
    'Four-wheel drive and self-balancing, with a seat that rises to eye level.',
  'xsto-m8-pro':
    'Everything the M8 does, with powered reclining and a powered leg rest.',
  'xsto-m4':
    'Self-levelling control and electric seat lifting for everyday journeys.',
  'xsto-m4b':
    'The M4 platform with redesigned front wheels and a folding footrest.',
  'xsto-m4-pro':
    'More seating adjustment, an integrated headrest and electric folding.',
  'xsto-x12':
    'Stair-climbing capability for suitable stairs, with assessment and training included.',
  'xsto-x12-pro':
    'The X12 with an electric elevating leg rest and Pro-exclusive comfort.',
};

/** Transparent studio cutouts bundled with the site; other chairs use Shopify imagery. */
const HERO_CUTOUTS: Partial<Record<HomepageFlagshipHandle, string>> = {
  'xsto-m4-pro': m4ProCutout,
  'xsto-m4b': m4bCutout,
  'xsto-x12': x12Cutout,
};

/**
 * Every product photo frames its chair differently, so each one is zoomed
 * (about its wheels) and lifted so the wheels meet the floor and the chairs
 * read as one family. `zoom` ≈ 0.9 ÷ how much of the image height the chair
 * fills; `lift` ≈ the empty space under the wheels × zoom. Re-measure these
 * if a product photo is replaced in Shopify.
 */
const HERO_FIT: Record<HomepageFlagshipHandle, {zoom: number; lift: number}> = {
  'xsto-m8': {zoom: 1.5, lift: 0.24}, // 360px source, chair fills ~59%
  'xsto-m8-pro': {zoom: 1.2, lift: 0.18},
  'xsto-m4': {zoom: 1.06, lift: 0.075},
  'xsto-m4b': {zoom: 0.95, lift: 0.03},
  'xsto-m4-pro': {zoom: 0.95, lift: 0.03},
  'xsto-x12': {zoom: 0.95, lift: 0.02},
  'xsto-x12-pro': {zoom: 1.14, lift: 0.125},
};

const PRE_ORDER_SLOTS = new Set<HomepageFlagshipHandle>([
  'xsto-m8',
  'xsto-m8-pro',
]);

const COUNT = HERO_MODELS.length;
const STEP_DEG = 360 / COUNT;
/** Chairs within this angle of the front are fully visible; beyond `gone` they are hidden. */
const FADE_FULL_DEG = STEP_DEG * 1.1;
const FADE_GONE_DEG = Math.min(STEP_DEG * 1.9, 150);
/** Where the neighbouring chair sits, as a multiple of the stage height. */
const NEIGHBOUR_OFFSET = {desktop: 1.17, mobile: 0.8};
const DWELL_MS = 6000;
const SPIN_MS = 1150;
/** Pixels of horizontal drag per turntable position. */
const DRAG_PX_PER_STEP = {desktop: 220, mobile: 140};

type HeroModel = {
  slot: HomepageFlagshipHandle;
  shortLabel: string;
  name: string;
  href: string;
  image: string;
  bundledImage: boolean;
  fit: {zoom: number; lift: number};
  pitch: string;
  badge: string;
  preOrder: boolean;
  exVat: string | null;
  incVat: string | null;
  deposit: string | null;
};

type Geometry = {
  width: number;
  height: number;
  itemHeight: number;
  radius: number;
  perspective: number;
  camera: number;
  floor: number;
};

const mod = (value: number, n: number) => ((value % n) + n) % n;
const easeOut = (t: number) => 1 - (1 - t) ** 3;

function isKeyboardFocus(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  try {
    return target.matches(':focus-visible');
  } catch {
    return true;
  }
}

/** Whole pounds read cleaner on a placard; keep pence only when they exist. */
function formatHeroPrice(amount: number, currencyCode: string): string {
  const rounded = Math.round(amount * 100) / 100;
  return formatProductPrice(rounded, currencyCode, {
    fractionDigits: Number.isInteger(rounded) ? 0 : 2,
  });
}

function shopifyImage(url: string, width: number): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('width', String(width));
    parsed.searchParams.delete('height');
    parsed.searchParams.delete('crop');
    return parsed.toString();
  } catch {
    return url;
  }
}

function buildModels(products: HomeProduct[]): HeroModel[] {
  return HERO_MODELS.map((slot) => {
    const handle = SHOPIFY_HOME_PRODUCT_HANDLES[slot];
    const product = products.find((item) => item.handle === handle);
    const cutout = HERO_CUTOUTS[slot];
    const image =
      cutout ?? product?.featuredImage?.url ?? HOMEPAGE_PRODUCT_THUMBS[slot];
    const price = product ? getProductListPrice(product) : null;
    const exVatAmount = price ? catalogToExVatAmount(price.amount) : null;
    const preOrder = PRE_ORDER_SLOTS.has(slot);
    return {
      slot,
      shortLabel: HOMEPAGE_FLAGSHIP_LABELS[slot],
      name: getProductDisplayName(handle, product?.title),
      href: `/products/${product?.handle ?? handle}`,
      image,
      bundledImage: Boolean(cutout),
      fit: HERO_FIT[slot],
      pitch: HERO_PITCH[slot],
      badge: HOMEPAGE_PRODUCT_BADGES[slot].badge,
      preOrder,
      exVat:
        price && exVatAmount !== null
          ? formatHeroPrice(exVatAmount, price.currencyCode)
          : null,
      incVat: price
        ? formatHeroPrice(
            catalogToIncVatAmount(price.amount),
            price.currencyCode,
          )
        : null,
      deposit:
        preOrder && price && exVatAmount !== null
          ? formatHeroPrice(exVatAmount / 10, price.currencyCode)
          : null,
    };
  });
}

/**
 * Ring radius that lands the neighbouring chair `target` px from the centre
 * once projected, whatever the spacing between chairs.
 */
function solveRadius(perspective: number, target: number): number {
  const theta = (STEP_DEG * Math.PI) / 180;
  let low = 0;
  let high = perspective * 0.9;
  for (let i = 0; i < 40; i++) {
    const radius = (low + high) / 2;
    const projected =
      (radius * Math.sin(theta) * perspective) /
      (perspective - radius * Math.cos(theta));
    if (projected < target) low = radius;
    else high = radius;
  }
  return (low + high) / 2;
}

/** Camera and ring proportions, all relative to the stage box. */
function measure(stage: HTMLElement): Geometry {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  const mobile = width < 768;
  const perspective = height * 3.8;
  const neighbour = mobile
    ? Math.min(height * NEIGHBOUR_OFFSET.mobile, width * 0.68)
    : height * NEIGHBOUR_OFFSET.desktop;
  return {
    width,
    height,
    itemHeight: height * 0.72,
    radius: solveRadius(perspective, neighbour),
    perspective,
    camera: height * 0.34,
    floor: height * 0.8,
  };
}

/** Where a chair sits for a given angle from the front (degrees). */
function project(rel: number, geometry: Geometry) {
  const rad = (rel * Math.PI) / 180;
  const x3 = geometry.radius * Math.sin(rad);
  const z3 = geometry.radius * Math.cos(rad);
  const scale = geometry.perspective / (geometry.perspective - z3);
  const x = x3 * scale;
  const feet = geometry.camera + (geometry.floor - geometry.camera) * scale;
  const distance = Math.abs(rel);
  const opacity =
    distance <= FADE_FULL_DEG
      ? 1
      : distance >= FADE_GONE_DEG
        ? 0
        : 1 - (distance - FADE_FULL_DEG) / (FADE_GONE_DEG - FADE_FULL_DEG);
  return {x, y: feet - geometry.itemHeight, scale, opacity, depth: z3};
}

export function HeroSection({products}: {products: HomeProduct[]}) {
  const models = useMemo(() => buildModels(products), [products]);
  const reducedMotion = useReducedMotion() ?? false;
  const baseId = useId();

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const rotating =
    hydrated && !reducedMotion && !paused && !hovered && !focused;

  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const geometryRef = useRef<Geometry | null>(null);
  const positionRef = useRef(0);
  const targetRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const dragRef = useRef<{
    startX: number;
    startPosition: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  const paint = useCallback(() => {
    const geometry = geometryRef.current;
    if (!geometry) return;
    const position = positionRef.current;
    itemRefs.current.forEach((element, index) => {
      if (!element) return;
      const rel = mod(index * STEP_DEG - position * STEP_DEG + 180, 360) - 180;
      const point = project(rel, geometry);
      element.style.transform = `translate(calc(-50% + ${point.x.toFixed(2)}px), ${point.y.toFixed(2)}px) scale(${point.scale.toFixed(4)})`;
      element.style.opacity = point.opacity.toFixed(3);
      element.style.visibility = point.opacity <= 0 ? 'hidden' : 'visible';
      element.style.zIndex = String(Math.round(point.depth + geometry.radius));
    });
  }, []);

  const cancelFrame = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const animateTo = useCallback(
    (target: number) => {
      targetRef.current = target;
      setActive(mod(Math.round(target), COUNT));
      cancelFrame();
      if (reducedMotion) {
        positionRef.current = target;
        paint();
        return;
      }
      const from = positionRef.current;
      const started = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - started) / SPIN_MS);
        positionRef.current = from + (target - from) * easeOut(progress);
        paint();
        frameRef.current =
          progress < 1 ? window.requestAnimationFrame(tick) : null;
      };
      frameRef.current = window.requestAnimationFrame(tick);
    },
    [cancelFrame, paint, reducedMotion],
  );

  const stepBy = useCallback(
    (delta: number) => animateTo(Math.round(targetRef.current) + delta),
    [animateTo],
  );

  const goTo = useCallback(
    (index: number) => {
      const current = mod(Math.round(targetRef.current), COUNT);
      let delta = mod(index - current, COUNT);
      if (delta > COUNT / 2) delta -= COUNT;
      animateTo(Math.round(targetRef.current) + delta);
    },
    [animateTo],
  );

  // Measure the stage, lay the chairs out, and keep them in place on resize.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const layout = () => {
      geometryRef.current = measure(stage);
      const {itemHeight, radius, perspective, camera, floor} =
        geometryRef.current;
      stage.style.setProperty('--tt-item-h', `${itemHeight}px`);
      stage.style.setProperty('--tt-item-w', `${itemHeight * 1.06}px`);
      stage.style.setProperty('--tt-radius', `${radius}px`);
      stage.style.setProperty('--tt-persp', `${perspective}px`);
      stage.style.setProperty('--tt-cam', `${camera}px`);
      stage.style.setProperty('--tt-floor', `${floor}px`);
      paint();
    };
    layout();
    setHydrated(true);
    const observer = new ResizeObserver(layout);
    observer.observe(stage);
    return () => {
      observer.disconnect();
      cancelFrame();
    };
  }, [cancelFrame, paint]);

  // Auto-advance while nothing is asking the turntable to hold still.
  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) stepBy(1);
    }, DWELL_MS);
    return () => window.clearInterval(timer);
  }, [rotating, stepBy, active]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    dragRef.current = {
      startX: event.clientX,
      startPosition: positionRef.current,
      moved: false,
    };
    cancelFrame();
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const geometry = geometryRef.current;
    if (!drag || !geometry) return;
    const dx = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(dx) > 5) {
      drag.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.classList.add('is-dragging');
    }
    if (!drag.moved) return;
    const perStep =
      geometry.width < 768 ? DRAG_PX_PER_STEP.mobile : DRAG_PX_PER_STEP.desktop;
    positionRef.current = drag.startPosition - dx / perStep;
    paint();
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    event.currentTarget.classList.remove('is-dragging');
    if (drag.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
      animateTo(Math.round(positionRef.current));
    }
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      stepBy(1);
      focusTab(mod(active + 1, COUNT));
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      stepBy(-1);
      focusTab(mod(active - 1, COUNT));
    } else if (event.key === 'Home') {
      event.preventDefault();
      goTo(0);
      focusTab(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      goTo(COUNT - 1);
      focusTab(COUNT - 1);
    }
  }

  function focusTab(index: number) {
    document.getElementById(`${baseId}-tab-${index}`)?.focus();
  }

  const current = models[active];
  const panelId = `${baseId}-panel`;

  return (
    <section
      className={`mr-turntable${rotating ? ' is-rotating' : ''}`}
      data-count={COUNT}
      aria-roledescription="carousel"
      aria-labelledby={`${baseId}-heading`}
      style={{'--tt-dwell': `${DWELL_MS}ms`} as CSSProperties}
      onFocusCapture={(event) => {
        // Hold the turntable for keyboard users; a mouse click leaves focus
        // behind too, but that should not stop the show.
        if (isKeyboardFocus(event.target)) setFocused(true);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }}
    >
      <div className="xsto-container">
        <div className="mr-turntable-head">
          <h1 id={`${baseId}-heading`}>
            Powered wheelchairs built for the way you live.
          </h1>
          <p className="mr-turntable-lede">
            {COUNT_WORDS[COUNT] ?? COUNT} XSTO models, from everyday
            self-balancing to stair climbing, supplied and supported in the UK
            by Bentech Medical.
          </p>
        </div>
      </div>

      {/* The turntable is decorative for assistive tech: the placard and strip carry the content. */}
      <div
        className="mr-turntable-stage"
        ref={stageRef}
        aria-hidden="true"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div className="mr-turntable-glow" />
        <div className="mr-turntable-floor-wrap">
          <div className="mr-turntable-floor" />
        </div>
        {models.map((model, index) => {
          const relative = mod(index - active + COUNT / 2, COUNT) - COUNT / 2;
          const nearFront = Math.abs(relative) <= 1;
          const src = model.bundledImage
            ? model.image
            : shopifyImage(model.image, 900);
          const fitStyle: CSSProperties = {
            transform: `translateY(${(model.fit.lift * 100).toFixed(1)}%) scale(${model.fit.zoom})`,
          };
          return (
            <button
              key={model.slot}
              type="button"
              tabIndex={-1}
              className="mr-turntable-item"
              data-pos={Math.round(relative)}
              data-current={index === active ? 'true' : undefined}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              onClick={() => {
                if (!suppressClickRef.current && index !== active) goTo(index);
              }}
            >
              <span className="mr-turntable-shadow" />
              <img
                alt=""
                src={src}
                style={fitStyle}
                srcSet={
                  model.bundledImage
                    ? undefined
                    : `${shopifyImage(model.image, 600)} 600w, ${shopifyImage(model.image, 900)} 900w, ${shopifyImage(model.image, 1200)} 1200w`
                }
                sizes={
                  model.bundledImage
                    ? undefined
                    : '(min-width: 768px) 32vw, 72vw'
                }
                width={720}
                height={760}
                loading={nearFront ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
                draggable={false}
              />
            </button>
          );
        })}
        <div className="mr-turntable-edge is-left" />
        <div className="mr-turntable-edge is-right" />
      </div>

      <div className="xsto-container">
        <div
          className="mr-turntable-placard"
          id={panelId}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${active}`}
        >
          <div className="mr-turntable-placard-inner" key={current.slot}>
            <p className="mr-turntable-model">
              {current.name}
              <span
                className={`mr-turntable-badge${current.preOrder ? '' : ' is-blue'}`}
              >
                {current.badge}
              </span>
            </p>
            <p className="mr-turntable-pitch">{current.pitch}</p>
            {current.exVat ? (
              <p className="mr-turntable-price">
                <strong>From {current.exVat}</strong> with VAT relief, if
                eligible, or {current.incVat} including VAT.
                {current.deposit ? (
                  <>
                    <br />
                    Pre-order with a {current.deposit} + VAT deposit. Estimated
                    delivery 12 weeks.
                  </>
                ) : null}
              </p>
            ) : (
              <p className="mr-turntable-price">
                Ask our UK team for current pricing and availability.
              </p>
            )}
            <div className="mr-turntable-actions">
              <Link className="mr-button" to={current.href} prefetch="intent">
                Explore the {current.shortLabel}
                <ArrowRight size={18} aria-hidden />
              </Link>
              <Link className="mr-turntable-compare" to="/compare">
                Compare all models
              </Link>
            </div>
          </div>
        </div>

        <div className="mr-turntable-strip">
          <div
            className="mr-turntable-tabs"
            role="tablist"
            aria-label="Choose a wheelchair"
          >
            {models.map((model, index) => (
              <button
                key={model.slot}
                type="button"
                role="tab"
                id={`${baseId}-tab-${index}`}
                className="mr-turntable-tab"
                aria-selected={index === active}
                aria-controls={panelId}
                tabIndex={index === active ? 0 : -1}
                onClick={() => goTo(index)}
                onKeyDown={onTabKeyDown}
              >
                {model.shortLabel}
              </button>
            ))}
          </div>
          <div className="mr-turntable-controls">
            <button
              type="button"
              aria-label="Previous wheelchair"
              onClick={() => stepBy(-1)}
            >
              <ChevronLeft size={18} aria-hidden />
            </button>
            {hydrated && !reducedMotion ? (
              <button
                type="button"
                aria-label={paused ? 'Resume rotation' : 'Pause rotation'}
                aria-pressed={paused}
                onClick={() => setPaused((value) => !value)}
              >
                {paused ? (
                  <Play size={16} aria-hidden />
                ) : (
                  <Pause size={16} aria-hidden />
                )}
              </button>
            ) : null}
            <button
              type="button"
              aria-label="Next wheelchair"
              onClick={() => stepBy(1)}
            >
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
