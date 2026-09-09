import {Link} from 'react-router';

export function AnnouncementBar() {
  return (
    <div className="site-announcement mr-announcement sticky top-0 z-50">
      <div className="xsto-container mr-announcement-inner">
        <p>Official UK distributor of <strong>XSTO</strong></p>
        <p className="mr-announcement-delivery">Free UK mainland wheelchair delivery</p>
        <Link className="mr-announcement-international" to="/international">
          International enquiries
        </Link>
      </div>
    </div>
  );
}
