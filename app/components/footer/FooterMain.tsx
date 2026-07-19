import {NavLink} from 'react-router';
import xstoWordmark from '~/assets/xsto-wordmark-light.png';
import {
  COMPANY,
  FOOTER_QUICK_LINKS,
  FOOTER_SUPPORT_LINKS,
} from '~/lib/site-navigation';
import {DistributorDisclaimer} from '~/components/footer/DistributorDisclaimer';
import {FooterBottom} from '~/components/footer/FooterBottom';
import {SafetyDisclaimer} from '~/components/footer/SafetyDisclaimer';

export function FooterMain() {
  return (
    <div className="bg-navy py-7 text-white md:py-8">
      <div className="xsto-container">
        <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:gap-x-6 md:mb-5 md:grid-cols-3 md:gap-x-8 md:gap-y-4">
          <div className="col-span-2 space-y-3 md:col-span-1">
            <img
              alt="XSTO — Mobility Robot"
              className="h-8 w-auto max-w-[180px] rounded-none object-contain object-left sm:h-9 sm:max-w-[200px]"
              decoding="async"
              height={36}
              src={xstoWordmark}
              width={200}
            />
            <p className="text-sm leading-snug text-white/85">
              Self-balancing powered wheelchairs — UK sales, delivery and support
              from Bentech Medical Ltd.
            </p>
            <address className="space-y-0.5 not-italic text-sm text-white/85">
              <p>
                <a
                  className="transition-colors hover:text-white"
                  href={COMPANY.phoneHref}
                >
                  {COMPANY.phone}
                </a>
              </p>
              <p>
                <a
                  className="transition-colors hover:text-white"
                  href={`mailto:${COMPANY.email}`}
                >
                  {COMPANY.email}
                </a>
              </p>
              <p>
                {COMPANY.address}, {COMPANY.city}, {COMPANY.postcode}
              </p>
            </address>
            <div className="flex items-center gap-2.5">
              <SocialLink href="https://www.facebook.com/xstouk" label="Facebook">
                <svg aria-hidden className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </SocialLink>
              <SocialLink href="https://www.instagram.com/xstouk" label="Instagram">
                <svg aria-hidden className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </SocialLink>
              <SocialLink href="https://www.youtube.com/@xstouk" label="YouTube">
                <svg aria-hidden className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </SocialLink>
            </div>
          </div>

          <FooterLinkColumn links={FOOTER_QUICK_LINKS} title="Quick Links" />
          <FooterLinkColumn links={FOOTER_SUPPORT_LINKS} title="Support" />
        </div>

        <SafetyDisclaimer />
        <DistributorDisclaimer />
        <FooterBottom />
      </div>
    </div>
  );
}

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{title: string; url: string}>;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-white">
        {title}
      </p>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.url}>
            <NavLink
              className="inline-flex min-h-9 items-center text-sm text-white/85 transition-colors hover:text-white"
              prefetch="intent"
              to={link.url}
            >
              {link.title}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white/50 hover:bg-white/10"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}
