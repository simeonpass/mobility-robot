import {getCartFeedback} from '~/lib/cart-feedback';

export function CartFeedback({data}: {data: unknown}) {
  const messages = getCartFeedback(data);
  if (!messages.length) return null;
  return (
    <div
      role="alert"
      className="my-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground"
    >
      {messages.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}
