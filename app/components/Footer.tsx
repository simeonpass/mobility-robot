import {FooterMain} from '~/components/footer/FooterMain';
import {FooterNewsletter} from '~/components/footer/FooterNewsletter';

export function Footer() {
  return (
    <footer className="mr-footer mt-auto">
      <details className="mr-newsletter-disclosure">
        <summary>News and product updates</summary>
        <FooterNewsletter />
      </details>
      <FooterMain />
    </footer>
  );
}
