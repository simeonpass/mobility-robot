import {redirect} from 'react-router';
import icon from '~/assets/xsto-favicon.png';

export function loader() {
  return redirect(icon, {headers: {'Cache-Control': 'public, max-age=3600'}});
}
