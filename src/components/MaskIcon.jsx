export default function MaskIcon({ src, colorClass = 'bg-brown', className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block ${colorClass} ${className}`}
      style={{
        maskImage: `url("${src}")`,
        WebkitMaskImage: `url("${src}")`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
      }}
    />
  );
}
