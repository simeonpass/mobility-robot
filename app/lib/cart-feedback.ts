type CartFeedbackData = {
  action?: string;
  errors?: Array<{message?: string}> | null;
  userErrors?: Array<{message?: string}> | null;
  warnings?: Array<{message?: string}> | null;
  cart?: {discountCodes?: Array<{code: string; applicable: boolean}>} | null;
};

export function getCartErrors(value: unknown): Array<{message: string}> {
  if (!value || typeof value !== 'object') return [];
  const result = value as CartFeedbackData;
  return [...(result.errors ?? []), ...(result.userErrors ?? [])].map(
    (item) => ({
      message:
        item.message?.trim() ||
        'We could not complete this basket update. Please try again.',
    }),
  );
}

export function getCartFeedback(value: unknown): string[] {
  if (!value || typeof value !== 'object') return [];
  const result = value as CartFeedbackData;
  const messages = [...getCartErrors(result), ...(result.warnings ?? [])]
    .map((item) => item.message?.trim())
    .filter((message): message is string => Boolean(message));
  if (result.action === 'DiscountCodesUpdate') {
    for (const code of result.cart?.discountCodes ?? []) {
      if (!code.applicable)
        messages.push(
          `The code “${code.code}” cannot be applied to this basket.`,
        );
    }
  }
  return [...new Set(messages)];
}

export function isCartMutationPending(
  fetchers: Array<{
    state: string;
    formAction?: string;
  }>,
) {
  return fetchers.some(
    (fetcher) =>
      fetcher.state !== 'idle' &&
      /\/cart(?:\?|$)/.test(fetcher.formAction ?? ''),
  );
}

/** Cart and promotion forms may only redirect within this storefront. */
export function safeStorefrontRedirect(
  value: unknown,
  requestUrl: string,
): string | null {
  if (typeof value !== 'string' || !value.startsWith('/')) return null;
  try {
    const target = new URL(value, requestUrl);
    if (target.origin !== new URL(requestUrl).origin) return null;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return null;
  }
}
