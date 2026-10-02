import type { ImgHTMLAttributes } from 'react';
import { photoSrcSet, photoUrl, type PhotoName } from '../../lib/images';

interface PhotoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  name: PhotoName;
  /** Largeur maximale téléchargée (px). */
  maxWidth?: number;
  /** Image visible dès l'arrivée sur la page : pas de chargement différé. */
  priority?: boolean;
}

/** Photo responsive : le navigateur choisit la taille adaptée à l'écran. */
export default function Photo({ name, maxWidth = 1800, priority = false, sizes = '100vw', alt = '', ...rest }: PhotoProps) {
  return (
    <img
      src={photoUrl(name, Math.min(1200, maxWidth))}
      srcSet={photoSrcSet(name, maxWidth)}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...rest}
    />
  );
}
