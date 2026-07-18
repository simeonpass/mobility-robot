import type {ProductFAQ} from '~/lib/product-faqs';
import type {FaqCategory} from '~/lib/faq-categories';

export function FaqAccordion({categories}: {categories: FaqCategory[]}) {
  return (
    <div className="space-y-10">
      {categories.map((category) => (
        <section aria-labelledby={`faq-${category.id}`} key={category.id}>
          <h2
            className="mb-4 text-xl font-semibold text-foreground"
            id={`faq-${category.id}`}
          >
            {category.title}
          </h2>
          <FaqList items={category.items} />
        </section>
      ))}
    </div>
  );
}

function FaqList({items}: {items: ProductFAQ[]}) {
  return (
    <div className="divide-y divide-border rounded-xl border border-border">
      {items.map((item) => (
        <details className="group px-5 py-4" key={item.question}>
          <summary className="cursor-pointer list-none font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-4">
              {item.question}
              <span
                aria-hidden
                className="text-gold transition-transform group-open:rotate-45"
              >
                +
              </span>
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
