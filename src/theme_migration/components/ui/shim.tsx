import React from 'react';

// NextJS Link Shim
export const Link = React.forwardRef(({ href, children, className, onClick, ...props }: any, ref: any) => {
  return (
    <a 
      ref={ref}
      href={href} 
      className={className} 
      {...props} 
      onClick={(e) => { 
        if (onClick) onClick(e);
        if (href?.startsWith('/')) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('app-navigate', { detail: href }));
        }
      }}
    >
      {children}
    </a>
  );
});

// NextJS Image Shim
export const Image = React.forwardRef(({ src, alt, width, height, className, fill, ...props }: any, ref: any) => {
  const style = fill ? { position: 'absolute' as const, height: '100%', width: '100%', left: 0, top: 0, right: 0, bottom: 0, objectFit: 'cover' as const } : undefined;
  // If src is a NextJS static import object, extract the src string.
  const imgSrc = typeof src === 'object' && src !== null ? src.src : src;
  
  return (
    <img 
      ref={ref}
      src={imgSrc} 
      alt={alt || ''} 
      width={width} 
      height={height} 
      className={className} 
      style={style} 
      {...props} 
    />
  );
});

// NextJS Font Shims
export const Pacifico = (opts: any) => ({ className: 'font-display', style: { fontFamily: 'var(--font-display)' } });
export const Inter = (opts: any) => ({ className: 'font-sans', style: { fontFamily: 'var(--font-sans)' } });
export const Roboto = (opts: any) => ({ className: 'font-sans', style: { fontFamily: 'var(--font-sans)' } });
export const Outfit = (opts: any) => ({ className: 'font-sans', style: { fontFamily: 'var(--font-sans)' } });

export default { Link, Image, Pacifico, Inter, Roboto, Outfit };
