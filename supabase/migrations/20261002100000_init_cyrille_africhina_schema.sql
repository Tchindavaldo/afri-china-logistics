/*
  AFRICHINA LOGISTICS — schéma initial

  Projet Supabase partagé avec les autres sites : tables, fonctions et
  policies sont préfixées `cyrille_africhina_` pour ne jamais entrer en conflit.

  Sécurité :
    - Les expéditions ne sont PAS lisibles par tout le monde. Le suivi public
      passe par la fonction `cyrille_africhina_track(numero)` qui ne renvoie qu'un seul
      colis : impossible de lister la base avec la clé anon.
    - Seuls les admins (table `cyrille_africhina_users`) peuvent créer, modifier ou
      supprimer des expéditions et les paramètres du site.
    - Pas d'inscription publique : seuls les comptes ajoutés dans
      `cyrille_africhina_users` (onglet « Utilisateurs » de l'admin) ont accès.
    - Un client connecté ne voit que les colis où son e-mail est celui de
      l'expéditeur ou du destinataire.
    - Un utilisateur ne peut pas modifier son propre rôle.

  À exécuter une fois dans Supabase > SQL Editor (idempotent).
*/

-- ---------------------------------------------------------------------------
-- Utilitaires
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.cyrille_africhina_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.cyrille_africhina_jwt_email()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

-- ---------------------------------------------------------------------------
-- Utilisateurs autorisés (rôles)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.cyrille_africhina_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email = lower(email)),
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS cyrille_africhina_users_touch ON public.cyrille_africhina_users;
CREATE TRIGGER cyrille_africhina_users_touch
  BEFORE UPDATE ON public.cyrille_africhina_users
  FOR EACH ROW EXECUTE FUNCTION public.cyrille_africhina_touch_updated_at();

-- Rôle actif de l'utilisateur courant (NULL si inconnu ou désactivé).
-- SECURITY DEFINER : évite la récursion RLS quand les policies l'appellent.
CREATE OR REPLACE FUNCTION public.cyrille_africhina_current_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.cyrille_africhina_users
  WHERE email = public.cyrille_africhina_jwt_email()
    AND active
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.cyrille_africhina_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(public.cyrille_africhina_current_role() = 'admin', false);
$$;

-- Appelée par le front après connexion : renvoie 'admin', 'client',
-- 'disabled' (compte désactivé) ou NULL (compte inconnu de ce site).
CREATE OR REPLACE FUNCTION public.cyrille_africhina_my_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := public.cyrille_africhina_jwt_email();
  v_role text;
  v_active boolean;
BEGIN
  IF auth.uid() IS NULL OR v_email = '' THEN
    RETURN NULL;
  END IF;

  SELECT role, active INTO v_role, v_active
  FROM public.cyrille_africhina_users
  WHERE email = v_email;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF NOT v_active THEN
    RETURN 'disabled';
  END IF;

  RETURN v_role;
END;
$$;

ALTER TABLE public.cyrille_africhina_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "africhina users: read own or admin" ON public.cyrille_africhina_users;
CREATE POLICY "africhina users: read own or admin"
  ON public.cyrille_africhina_users FOR SELECT
  TO authenticated
  USING (email = public.cyrille_africhina_jwt_email() OR public.cyrille_africhina_is_admin());

DROP POLICY IF EXISTS "africhina users: admin insert" ON public.cyrille_africhina_users;
CREATE POLICY "africhina users: admin insert"
  ON public.cyrille_africhina_users FOR INSERT
  TO authenticated
  WITH CHECK (public.cyrille_africhina_is_admin());

DROP POLICY IF EXISTS "africhina users: admin update" ON public.cyrille_africhina_users;
CREATE POLICY "africhina users: admin update"
  ON public.cyrille_africhina_users FOR UPDATE
  TO authenticated
  USING (public.cyrille_africhina_is_admin())
  WITH CHECK (public.cyrille_africhina_is_admin());

DROP POLICY IF EXISTS "africhina users: admin delete" ON public.cyrille_africhina_users;
CREATE POLICY "africhina users: admin delete"
  ON public.cyrille_africhina_users FOR DELETE
  TO authenticated
  USING (public.cyrille_africhina_is_admin());

-- ---------------------------------------------------------------------------
-- Expéditions
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.cyrille_africhina_shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number text NOT NULL UNIQUE CHECK (tracking_number = upper(tracking_number)),

  -- Statut affiché au client
  status text NOT NULL DEFAULT '',
  status_date date,
  status_time text NOT NULL DEFAULT '',

  -- Itinéraire (villes en texte libre + pays ISO-2 pour le globe)
  origin text NOT NULL DEFAULT '',
  origin_country text NOT NULL DEFAULT '',
  destination text NOT NULL DEFAULT '',
  destination_country text NOT NULL DEFAULT '',
  transport_mode text NOT NULL DEFAULT 'sea' CHECK (transport_mode IN ('sea', 'air')),
  carrier text NOT NULL DEFAULT '',
  carrier_reference text NOT NULL DEFAULT '',

  -- Marchandise
  product text NOT NULL DEFAULT '',
  package_description text NOT NULL DEFAULT '',
  type_of_shipment text NOT NULL DEFAULT '',
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  weight text NOT NULL DEFAULT '',

  -- Calendrier et progression. Si total_duration_days > 0, la progression
  -- est calculée chaque jour à partir de departure_date ; sinon on utilise
  -- tracking_progress / tracking_stage saisis à la main.
  departure_date date,
  departure_time text NOT NULL DEFAULT '',
  expected_delivery_date date,
  delivery_time text NOT NULL DEFAULT '',
  total_duration_days integer NOT NULL DEFAULT 0 CHECK (total_duration_days >= 0),
  tracking_progress integer NOT NULL DEFAULT 0 CHECK (tracking_progress BETWEEN 0 AND 100),
  tracking_stage text NOT NULL DEFAULT 'picked_up'
    CHECK (tracking_stage IN ('picked_up', 'in_transit', 'customs', 'out_for_delivery', 'delivered')),

  -- Frais
  payment_mode text NOT NULL DEFAULT '',
  total_freight text NOT NULL DEFAULT '',
  insurances jsonb NOT NULL DEFAULT '[]'::jsonb,
  import_tax text NOT NULL DEFAULT '',
  import_tax_paid boolean NOT NULL DEFAULT false,

  -- Contacts
  shipper_name text NOT NULL DEFAULT '',
  shipper_phone text NOT NULL DEFAULT '',
  shipper_email text NOT NULL DEFAULT '',
  shipper_address text NOT NULL DEFAULT '',
  receiver_name text NOT NULL DEFAULT '',
  receiver_phone text NOT NULL DEFAULT '',
  receiver_email text NOT NULL DEFAULT '',
  receiver_address text NOT NULL DEFAULT '',

  comment text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cyrille_africhina_shipments_shipper_email_idx
  ON public.cyrille_africhina_shipments (lower(shipper_email));
CREATE INDEX IF NOT EXISTS cyrille_africhina_shipments_receiver_email_idx
  ON public.cyrille_africhina_shipments (lower(receiver_email));
CREATE INDEX IF NOT EXISTS cyrille_africhina_shipments_created_at_idx
  ON public.cyrille_africhina_shipments (created_at DESC);

DROP TRIGGER IF EXISTS cyrille_africhina_shipments_touch ON public.cyrille_africhina_shipments;
CREATE TRIGGER cyrille_africhina_shipments_touch
  BEFORE UPDATE ON public.cyrille_africhina_shipments
  FOR EACH ROW EXECUTE FUNCTION public.cyrille_africhina_touch_updated_at();

ALTER TABLE public.cyrille_africhina_shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "africhina shipments: admin or own" ON public.cyrille_africhina_shipments;
CREATE POLICY "africhina shipments: admin or own"
  ON public.cyrille_africhina_shipments FOR SELECT
  TO authenticated
  USING (
    public.cyrille_africhina_is_admin()
    OR (
      public.cyrille_africhina_current_role() IS NOT NULL
      AND public.cyrille_africhina_jwt_email() <> ''
      AND public.cyrille_africhina_jwt_email() IN (lower(shipper_email), lower(receiver_email))
    )
  );

DROP POLICY IF EXISTS "africhina shipments: admin insert" ON public.cyrille_africhina_shipments;
CREATE POLICY "africhina shipments: admin insert"
  ON public.cyrille_africhina_shipments FOR INSERT
  TO authenticated
  WITH CHECK (public.cyrille_africhina_is_admin());

DROP POLICY IF EXISTS "africhina shipments: admin update" ON public.cyrille_africhina_shipments;
CREATE POLICY "africhina shipments: admin update"
  ON public.cyrille_africhina_shipments FOR UPDATE
  TO authenticated
  USING (public.cyrille_africhina_is_admin())
  WITH CHECK (public.cyrille_africhina_is_admin());

DROP POLICY IF EXISTS "africhina shipments: admin delete" ON public.cyrille_africhina_shipments;
CREATE POLICY "africhina shipments: admin delete"
  ON public.cyrille_africhina_shipments FOR DELETE
  TO authenticated
  USING (public.cyrille_africhina_is_admin());

-- Suivi public : un numéro => un colis, rien d'autre.
CREATE OR REPLACE FUNCTION public.cyrille_africhina_track(p_tracking_number text)
RETURNS SETOF public.cyrille_africhina_shipments
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.cyrille_africhina_shipments
  WHERE tracking_number = upper(btrim(p_tracking_number))
  LIMIT 1;
$$;

-- ---------------------------------------------------------------------------
-- Paramètres du site (une seule ligne, id = 1)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.cyrille_africhina_site_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name text NOT NULL DEFAULT 'AFRICHINA LOGISTICS',
  company_description text NOT NULL DEFAULT '',
  site_email text NOT NULL DEFAULT '',
  support_email text NOT NULL DEFAULT '',
  site_phone text NOT NULL DEFAULT '',
  whatsapp_phone text NOT NULL DEFAULT '',
  site_address text NOT NULL DEFAULT '',
  opening_hours text NOT NULL DEFAULT 'Lun – Sam · 8h – 18h',
  whatsapp_country_code text NOT NULL DEFAULT '237',
  whatsapp_template text NOT NULL DEFAULT
    'Bonjour {nom}, votre expédition {numero} ({origine} → {destination}) est enregistrée chez {societe}. Suivez-la en temps réel ici : {lien}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS cyrille_africhina_site_settings_touch ON public.cyrille_africhina_site_settings;
CREATE TRIGGER cyrille_africhina_site_settings_touch
  BEFORE UPDATE ON public.cyrille_africhina_site_settings
  FOR EACH ROW EXECUTE FUNCTION public.cyrille_africhina_touch_updated_at();

ALTER TABLE public.cyrille_africhina_site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "africhina settings: public read" ON public.cyrille_africhina_site_settings;
CREATE POLICY "africhina settings: public read"
  ON public.cyrille_africhina_site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "africhina settings: admin insert" ON public.cyrille_africhina_site_settings;
CREATE POLICY "africhina settings: admin insert"
  ON public.cyrille_africhina_site_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.cyrille_africhina_is_admin());

DROP POLICY IF EXISTS "africhina settings: admin update" ON public.cyrille_africhina_site_settings;
CREATE POLICY "africhina settings: admin update"
  ON public.cyrille_africhina_site_settings FOR UPDATE
  TO authenticated
  USING (public.cyrille_africhina_is_admin())
  WITH CHECK (public.cyrille_africhina_is_admin());

INSERT INTO public.cyrille_africhina_site_settings (id, site_email, support_email)
VALUES (1, 'contact@africhinalogistics.com', 'support@africhinalogistics.com')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Droits d'exécution des fonctions
-- ---------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.cyrille_africhina_my_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cyrille_africhina_my_role() TO authenticated;

REVOKE ALL ON FUNCTION public.cyrille_africhina_track(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cyrille_africhina_track(text) TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.cyrille_africhina_is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cyrille_africhina_current_role() TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Stockage des photos de colis (bucket partagé, dossier africhina/)
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('shipment-images', 'shipment-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "africhina images: admin upload" ON storage.objects;
CREATE POLICY "africhina images: admin upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'shipment-images'
    AND (storage.foldername(name))[1] = 'africhina'
    AND public.cyrille_africhina_is_admin()
  );

DROP POLICY IF EXISTS "africhina images: admin delete" ON storage.objects;
CREATE POLICY "africhina images: admin delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'shipment-images'
    AND (storage.foldername(name))[1] = 'africhina'
    AND public.cyrille_africhina_is_admin()
  );

-- ---------------------------------------------------------------------------
-- Administrateur initial (le compte doit exister dans Supabase Auth ou être
-- créé avec cet e-mail). Ajoutez d'autres admins depuis l'onglet
-- « Utilisateurs » du tableau de bord.
-- ---------------------------------------------------------------------------

INSERT INTO public.cyrille_africhina_users (email, role)
VALUES ('junior@gmail.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin', active = true;
