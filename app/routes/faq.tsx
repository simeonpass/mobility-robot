import type {Route} from './+types/faq';
import {FaqAccordion} from '~/components/content/FaqAccordion';
import {JsonLd, PageHeader, PageShell} from '~/components/content/PageShell';
import {FAQ_CATEGORIES, getAllFaqs} from '~/lib/faq-categories';
import {buildMeta, faqJsonLd} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: 'Frequently Asked Questions',
    description:
      'FAQ for XSTO wheelchairs from Mobility Robot — UK delivery, warranty, VAT relief and trade enquiries.',
    path: '/faq',
  });

export default function FaqPage() {
  const faqJsonLdData = faqJsonLd(getAllFaqs());

  return (
    <PageShell>
      <JsonLd data={faqJsonLdData} />
      <PageHeader
        breadcrumbs={[
          {name: 'Home', path: '/'},
          {name: 'FAQ'},
        ]}
        description="Everything you need to know about XSTO products, ordering, warranty, VAT relief and trade accounts."
        title="Frequently Asked Questions"
      />
      <FaqAccordion categories={FAQ_CATEGORIES} />
    </PageShell>
  );
}
