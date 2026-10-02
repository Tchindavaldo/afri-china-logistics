import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <SEO title="Page introuvable" noindex />
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle,black,transparent_70%)]" />
      <div className="container-x relative flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <p className="font-mono text-sm tracking-[0.3em] text-cobalt-500">ERREUR 404</p>
        <h1 className="mt-4 font-display text-5xl font-extrabold text-ink sm:text-7xl">Hors itinéraire.</h1>
        <p className="mt-5 max-w-md text-lg text-muted">Cette page n'existe pas ou a été déplacée. Reprenons la route.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn btn-primary">
            <ArrowLeft className="size-4" /> Retour à l'accueil
          </Link>
          <Link to="/track" className="btn btn-outline">
            <Search className="size-4" /> Suivre un colis
          </Link>
        </div>
      </div>
    </section>
  );
}
