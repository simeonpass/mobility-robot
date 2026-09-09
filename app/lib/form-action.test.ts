import {beforeEach, describe, expect, it, vi} from 'vitest';
import {handleValidatedFormAction} from './form-action';
import {contactFormSchema, demoRequestSchema} from './form-schemas';
import {sendFormNotification} from './form-notifications';

vi.mock('./form-notifications', () => ({sendFormNotification: vi.fn()}));
const valid = {
  name: 'Alex Smith',
  email: 'alex@example.com',
  phone: '02080504849',
  topic: 'Product advice',
  orderRef: '',
  message: 'Can I book a demonstration of the M4?',
};
const origin = 'https://mobilityrobot.co.uk';
async function submit(
  body: unknown,
  headers: Record<string, string> = {origin},
  schema = contactFormSchema,
) {
  return handleValidatedFormAction({
    request: new Request(`${origin}/api/contact`, {
      method: 'POST',
      headers: {'content-type': 'application/json', ...headers},
      body: JSON.stringify(body),
    }),
    context: {env: {}},
    schema,
    formType: 'contact',
    subject: 'Enquiry',
    buildFields: () => ({Message: 'test'}),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(sendFormNotification).mockResolvedValue({
    ok: true,
    provider: 'resend',
  });
});
describe('form spam protection', () => {
  it('delivers a normal enquiry once', async () => {
    expect((await submit(valid)).status).toBe(200);
    expect(sendFormNotification).toHaveBeenCalledTimes(1);
  });
  it.each([
    {},
    {origin: 'https://spam.example'},
    {origin: 'null'},
    {origin, 'sec-fetch-site': 'cross-site'},
  ])('blocks invalid request sources %j', async (headers) => {
    expect((await submit(valid, headers)).status).toBe(403);
    expect(sendFormNotification).not.toHaveBeenCalled();
  });
  it('accepts same-origin Referer when Origin is absent', async () => {
    expect((await submit(valid, {referer: `${origin}/contact`})).status).toBe(
      200,
    );
    expect(sendFormNotification).toHaveBeenCalledTimes(1);
  });
  it('does not let a good Referer override an invalid Origin', async () => {
    expect(
      (
        await submit(valid, {
          origin: 'https://spam.example',
          referer: `${origin}/contact`,
        })
      ).status,
    ).toBe(403);
    expect(sendFormNotification).not.toHaveBeenCalled();
  });
  it('silently drops a filled honeypot without emailing', async () => {
    const response = await submit({...valid, website: 'https://spam.example'});
    expect(await response.json()).toEqual({ok: true});
    expect(sendFormNotification).not.toHaveBeenCalled();
  });
  it('keeps the honeypot through client-side schema parsing', () => {
    expect(contactFormSchema.parse({...valid, website: 'bot'}).website).toBe(
      'bot',
    );
  });
  it('rejects the reported random-letter pattern before email delivery', async () => {
    const response = await submit({
      ...valid,
      name: 'KwcoOrjFUGBUrYnPMJokYSd',
      orderRef: 'GIaPnmCWjUYxxKuitP',
      message: 'YrANaYpalxpMDTQGQz',
    });
    expect(response.status).toBe(400);
    expect((await response.json()).fieldErrors.message).toContain(
      'describe your enquiry',
    );
    expect(sendFormNotification).not.toHaveBeenCalled();
  });
  it.each(['李小明', 'Jean-Luc O’Neill', 'KwcoOrjFUGBUrYnPMJokYSd'])(
    'accepts a genuine message regardless of name: %s',
    async (name) => {
      expect((await submit({...valid, name})).status).toBe(200);
      expect(sendFormNotification).toHaveBeenCalledTimes(1);
    },
  );
  it('preserves provider errors instead of falsely reporting delivery', async () => {
    vi.mocked(sendFormNotification).mockResolvedValue({
      ok: false,
      configured: true,
      error: 'Try again',
    });
    expect((await submit(valid)).status).toBe(502);
  });
  it('rejects malformed fields without emailing', async () => {
    expect((await submit(null)).status).toBe(400);
    expect(sendFormNotification).not.toHaveBeenCalled();
  });
  it('still accepts the existing demo form schema', async () => {
    const response = await handleValidatedFormAction({
      request: new Request(`${origin}/api/demo-request`, {
        method: 'POST',
        headers: {origin, 'content-type': 'application/json'},
        body: JSON.stringify({
          name: 'Alex Smith',
          email: 'alex@example.com',
          phone: '02080504849',
          postcode: 'BH21 7RR',
          model: 'M4',
        }),
      }),
      context: {env: {}},
      schema: demoRequestSchema,
      formType: 'demo',
      subject: 'Demo',
      buildFields: (v) => ({Name: v.name}),
    });
    expect(response.status).toBe(200);
    expect(sendFormNotification).toHaveBeenCalledTimes(1);
  });
});
