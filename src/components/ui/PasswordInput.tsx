import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted/70" />
      <input {...props} type={visible ? 'text' : 'password'} className="input pr-12 pl-11" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-2 text-muted hover:text-ink"
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
      </button>
    </div>
  );
}
