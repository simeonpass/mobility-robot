type StarRatingProps = {
  rating: number;
  size?: 'sm' | 'md';
  className?: string;
};

export function StarRating({rating, size = 'sm', className}: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, rating));
  const sizeClass = size === 'md' ? 'text-base' : 'text-sm';

  return (
    <span
      aria-label={`${clamped} out of 5 stars`}
      className={[
        'inline-flex items-center gap-0.5 text-gold',
        sizeClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {Array.from({length: 5}, (_, index) => {
        const filled = index < Math.round(clamped);
        return (
          <span aria-hidden key={index}>
            {filled ? '★' : '☆'}
          </span>
        );
      })}
    </span>
  );
}
