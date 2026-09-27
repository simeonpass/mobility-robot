import {Link} from 'react-router';

export function M8BuyingGuide({pro}: {pro: boolean}) {
  const model = pro ? 'M8 Pro' : 'M8';
  return (
    <section className="mr-m8-guide" aria-label={`Choosing the ${model}`}>
      <h2>
        {pro
          ? 'Powered seating, with four-wheel drive.'
          : 'Four-wheel drive, with manual seating adjustment.'}
      </h2>
      <p>
        Both models offer self-balancing and powered seat elevation. Choose
        around how you want to adjust your seating.
      </p>
      <dl>
        <div>
          <dt>This {model}</dt>
          <dd>
            {pro
              ? 'Powered 90–135° backrest recline and powered leg rest.'
              : 'Manual 90–125° backrest recline and manual leg rest.'}
          </dd>
        </div>
        <div>
          <dt>Check your fit</dt>
          <dd>
            Talk through seating, transfers, storage and your usual routes with
            our UK team.
          </dd>
        </div>
      </dl>
      <p className="mr-m8-guide-note">
        The M8 series is not a stair-climbing chair. Battery range depends on
        the configuration and conditions.
      </p>
      <Link
        className="mr-m8-demo-link"
        to={`/demo?model=${encodeURIComponent(model)}`}
        data-enquiry-action="demo"
        data-enquiry-placement="product_summary"
        data-enquiry-model={model}
      >
        Arrange an {model} demo <span aria-hidden>↗</span>
      </Link>
    </section>
  );
}
