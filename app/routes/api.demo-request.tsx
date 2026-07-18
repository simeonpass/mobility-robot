import {data} from 'react-router';
import type {Route} from './+types/api.demo-request';

export async function action({request}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {status: 405});
  }
  await request.json().catch(() => null);
  return data({ok: true});
}

export default function DemoRequestApiRoute() {
  return null;
}
