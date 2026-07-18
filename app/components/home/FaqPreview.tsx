import {Link} from 'react-router';
import {SectionIntro} from '~/components/home/SectionIntro';
import {homepageFAQs} from '~/lib/product-faqs';

export function FaqPreview() {
  return (
    <section className="xsto-section bg-background">
      <div className="xsto-container max-w-4xl">
        <SectionIntro
          accent="Questions."
          description="Everything you need to know about the XSTO M4."
          label="Helpful answers"
          title="Common"
        />

        <div className="divide-y divide-border rounded-2xl border border-border bg-card shadow-soft">
          {homepageFAQs.map((item) => (
            <details className="group px-5 py-4 md:px-6" key={item.question}>
              <summary className="cursor-pointer list-none font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.question}
                  <span
                    aria-hidden
                    className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-gold transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 pb-1 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </details>
          ))}
        </div>

        <p className="mt-8 text-center">
          <Link
            className="text-sm font-semibold text-gold underline-offset-4 hover:underline"
            prefetch="intent"
            to="/faq"
          >
            View all FAQs →
          </Link>
        </p>
      </div>
    </section>
  );
}
