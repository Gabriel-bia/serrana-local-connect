CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','operator','viewer'));
$$;

CREATE OR REPLACE FUNCTION public.can_edit(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','operator'));
$$;

CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  store_id text REFERENCES public.stores(id) ON DELETE SET NULL,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read clients" ON public.clients FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "admin write clients" ON public.clients FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  store_id text REFERENCES public.stores(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  assignee text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgente','alta','normal','baixa')),
  due_date date,
  status text NOT NULL DEFAULT 'a_fazer' CHECK (status IN ('a_fazer','em_andamento','aguardando','concluida')),
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read tasks" ON public.tasks FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff create tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (public.can_edit(auth.uid()));
CREATE POLICY "staff update tasks" ON public.tasks FOR UPDATE TO authenticated
  USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));
CREATE POLICY "admin delete tasks" ON public.tasks FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE SEQUENCE IF NOT EXISTS public.admin_requests_code_seq START 100;
CREATE TABLE IF NOT EXISTS public.admin_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code integer NOT NULL DEFAULT nextval('public.admin_requests_code_seq'),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  store_id text REFERENCES public.stores(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'outro',
  description text NOT NULL DEFAULT '',
  current_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  requested_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  origin text NOT NULL DEFAULT 'painel',
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','em_analise','aguardando_confirmacao','aprovada','recusada','corrigida','concluida')),
  notes text NOT NULL DEFAULT '',
  assignee text NOT NULL DEFAULT '',
  approved_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS admin_requests_code_key ON public.admin_requests(code);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_requests TO authenticated;
GRANT ALL ON public.admin_requests TO service_role;
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read requests" ON public.admin_requests FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff create requests" ON public.admin_requests FOR INSERT TO authenticated WITH CHECK (public.can_edit(auth.uid()));
CREATE POLICY "admin update requests" ON public.admin_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete requests" ON public.admin_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor text NOT NULL DEFAULT '',
  actor_id uuid,
  action text NOT NULL,
  entity_table text NOT NULL DEFAULT '',
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  origin text NOT NULL DEFAULT 'painel',
  request_id uuid REFERENCES public.admin_requests(id) ON DELETE SET NULL,
  summary text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_log_created_idx ON public.audit_log(created_at DESC);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read audit" ON public.audit_log FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff insert audit" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (public.can_edit(auth.uid()));

CREATE TRIGGER touch_clients BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_tasks BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_admin_requests BEFORE UPDATE ON public.admin_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();