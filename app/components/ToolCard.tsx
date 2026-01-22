import Link from 'next/link';

interface ToolCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  bgImage?: string;
}

export default function ToolCard({ title, description, icon, href, bgImage }: ToolCardProps) {
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }} target="_self" prefetch={false}>
      <div className="card" style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Dark overlay for better text readability */}
        {bgImage && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)',
            zIndex: 0
          }} />
        )}
        
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 'clamp(2.5rem, 5vw, 3rem)' }}>{icon}</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{title}</h3>
          <p style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: '1.5' }}>
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
