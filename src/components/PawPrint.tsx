interface PawPrintProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  opacity?: number;
}

export function PawPrint({ className = '', size = 'md', opacity = 0.1 }: PawPrintProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <svg
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ opacity }}
    >
      <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm6 8c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM6 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm3 6c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v1c0 2.2-1.8 4-4 4s-4-1.8-4-4v-1z"/>
    </svg>
  );
}

export function PawBackground({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <PawPrint className="absolute top-10 left-10 text-primary rotate-12" size="sm" opacity={0.05} />
        <PawPrint className="absolute top-32 right-20 text-secondary -rotate-12" size="md" opacity={0.03} />
        <PawPrint className="absolute bottom-20 left-1/4 text-accent rotate-45" size="sm" opacity={0.04} />
        <PawPrint className="absolute bottom-32 right-1/3 text-primary -rotate-45" size="lg" opacity={0.02} />
        <PawPrint className="absolute top-1/2 left-1/2 text-secondary rotate-90" size="md" opacity={0.02} />
      </div>
    </div>
  );
}