import {FooterMain} from '~/components/footer/FooterMain';
import {FooterNewsletter} from '~/components/footer/FooterNewsletter';

export function Footer() {
  return (
    <footer className="mt-auto">
      <FooterNewsletter />
      <FooterMain />
    </footer>
  );
}
