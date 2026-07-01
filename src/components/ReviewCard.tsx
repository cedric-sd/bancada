import type { ReviewView } from '@/lib/reviews';
import Avatar from './Avatar';

const starsStr = (n: number) => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);

/**
 * Review da comunidade — bilhete de papel preso com fita.
 */
export default function ReviewCard({
  review,
  rotate = -0.4,
  mine = false,
}: {
  review: ReviewView;
  rotate?: number;
  mine?: boolean;
}) {
  const handleSlug = review.handle.replace(/^@/, '');
  return (
    <div
      style={{
        position: 'relative',
        background: '#fbf6e6',
        border: mine ? '1px solid #cbb066' : '1px solid #e0d2a8',
        borderRadius: 4,
        padding: '13px 16px',
        boxShadow: '0 2px 0 rgba(0,0,0,.06),0 6px 14px rgba(0,0,0,.14)',
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: -7,
          left: 18,
          width: 60,
          height: 18,
          background: 'rgba(231,217,173,.6)',
          borderLeft: '1px dashed rgba(0,0,0,.14)',
          borderRight: '1px dashed rgba(0,0,0,.14)',
          transform: 'rotate(-3deg)',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
          <Avatar
            initials={review.initials}
            size={26}
            src={review.hasAvatar ? `/api/users/${handleSlug}/avatar` : undefined}
          />
          <span style={{ font: '700 12px var(--font-archivo)', color: '#221c12' }}>{review.name}</span>
          <span style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.5)' }}>{review.handle}</span>
          {mine ? (
            <span
              style={{
                font: '700 8px var(--font-mono)',
                letterSpacing: '.08em',
                color: '#9a6a1f',
                border: '1px solid #cbb066',
                padding: '2px 5px',
                borderRadius: 4,
              }}
            >
              SUA
            </span>
          ) : null}
        </div>
        <span style={{ font: '700 13px var(--font-mono)', color: '#c8951f', letterSpacing: 1, flex: 'none' }}>
          {starsStr(review.stars)}
        </span>
      </div>
      {review.text ? (
        <p style={{ margin: '9px 0 0', font: '400 14px/1.5 var(--font-news)', color: '#433c2e' }}>{review.text}</p>
      ) : null}
    </div>
  );
}
