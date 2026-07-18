import type {ContentSection} from '~/lib/content/warranty-returns';

export function ContentWithToc({sections}: {sections: ContentSection[]}) {
  return (
    <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
      <nav
        aria-label="Table of contents"
        className="hidden lg:block"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          On this page
        </p>
        <ul className="sticky top-24 space-y-2 text-sm">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                className="text-muted-foreground hover:text-gold"
                href={`#${section.id}`}
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0 space-y-10">
        {sections.map((section) => (
          <section id={section.id} key={section.id}>
            <h2 className="text-xl font-semibold text-foreground">
              {section.title}
            </h2>
            <div className="mt-4 space-y-4 text-muted-foreground">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
              {section.listItems ? (
                <ul className="list-disc space-y-2 pl-5">
                  {section.listItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
