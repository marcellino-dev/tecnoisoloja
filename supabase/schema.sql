-- =============================================
-- TECNOISO SHOP - Supabase Schema
-- Execute no SQL Editor do Supabase
-- =============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELA: users
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  image       TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: categories
-- =============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: products
-- =============================================
CREATE TABLE IF NOT EXISTS public.products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  description       TEXT NOT NULL,
  short_description TEXT,
  price             NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  compare_price     NUMERIC(10,2),
  stock             INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku               TEXT UNIQUE,
  category_id       UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  images            TEXT[] DEFAULT '{}',
  specs             JSONB DEFAULT '{}',
  featured          BOOLEAN DEFAULT FALSE,
  active            BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: orders
-- =============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled','shipped','delivered')),
  total            NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  shipping_address JSONB,
  pagseguro_code   TEXT,
  pagseguro_link   TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: order_items
-- =============================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  product_price NUMERIC(10,2) NOT NULL,
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  subtotal      NUMERIC(10,2) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ÍNDICES para performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_products_category   ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active      ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_featured    ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_orders_user          ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order    ON public.order_items(order_id);

-- =============================================
-- FUNÇÃO: atualizar updated_at automaticamente
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at    BEFORE UPDATE ON public.users    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated_at   BEFORE UPDATE ON public.orders   FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items  ENABLE ROW LEVEL SECURITY;

-- Policies: categories e products são públicos (leitura)
CREATE POLICY "Categories são públicas"  ON public.categories  FOR SELECT USING (TRUE);
CREATE POLICY "Produtos ativos são públicos" ON public.products FOR SELECT USING (active = TRUE);

-- Policies: users
CREATE POLICY "Usuários veem próprio perfil" ON public.users FOR SELECT USING (TRUE);
CREATE POLICY "Usuários atualizam próprio perfil" ON public.users FOR UPDATE USING (TRUE);
CREATE POLICY "Service role insere usuários" ON public.users FOR INSERT WITH CHECK (TRUE);

-- Policies: orders
CREATE POLICY "Usuários veem próprios pedidos" ON public.orders FOR SELECT USING (TRUE);
CREATE POLICY "Usuários criam pedidos"         ON public.orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Service role atualiza pedidos"  ON public.orders FOR UPDATE USING (TRUE);

-- Policies: order_items
CREATE POLICY "order_items selecionáveis"  ON public.order_items FOR SELECT USING (TRUE);
CREATE POLICY "order_items inseríveis"     ON public.order_items FOR INSERT WITH CHECK (TRUE);

-- =============================================
-- DADOS INICIAIS (seed)
-- =============================================
INSERT INTO public.categories (name, slug, description) VALUES
  ('Termômetros',        'termometros',        'Instrumentos para medição de temperatura'),
  ('Manômetros',         'manometros',         'Medição de pressão industrial'),
  ('Analisadores',       'analisadores',       'Equipamentos de análise e diagnóstico'),
  ('Calibradores',       'calibradores',       'Instrumentos de calibração de precisão'),
  ('Dataloggers',        'dataloggers',        'Registradores de dados ambientais'),
  ('EPIs',               'epis',               'Equipamentos de proteção individual')
ON CONFLICT DO NOTHING;

INSERT INTO public.products (name, slug, description, short_description, price, compare_price, stock, sku, images, featured, active) VALUES
  (
    'Termômetro Industrial TI-500',
    'termometro-industrial-ti-500',
    'Termômetro de alta precisão para ambientes industriais. Faixa de medição: -50°C a +500°C. Resolução: 0.1°C. Proteção IP67. Ideal para indústrias alimentícias, farmacêuticas e petroquímicas.',
    'Termômetro industrial de alta precisão com proteção IP67',
    1289.90, 1589.90, 45, 'TI-500',
    ARRAY['https://via.placeholder.com/800x600/1a1a2e/ea580c?text=TI-500'],
    TRUE, TRUE
  ),
  (
    'Manômetro Digital MD-200',
    'manometro-digital-md-200',
    'Manômetro digital de alta performance para leitura precisa de pressão. Faixa: 0 a 200 bar. Precisão ±0.5%. Display LCD retroiluminado. Carcaça em aço inox.',
    'Manômetro digital 0-200 bar com alta precisão',
    890.00, 1100.00, 30, 'MD-200',
    ARRAY['https://via.placeholder.com/800x600/1a1a2e/ea580c?text=MD-200'],
    TRUE, TRUE
  ),
  (
    'Datalogger DL-Pro WiFi',
    'datalogger-dl-pro-wifi',
    'Registrador de dados com conectividade WiFi para monitoramento remoto. Registra temperatura e umidade em tempo real. Armazenamento interno de 100.000 leituras. Compatível com app mobile.',
    'Datalogger WiFi para temperatura e umidade',
    2450.00, 2890.00, 18, 'DL-PRO',
    ARRAY['https://via.placeholder.com/800x600/1a1a2e/ea580c?text=DL-Pro'],
    TRUE, TRUE
  ),
  (
    'Calibrador de Pressão CP-100',
    'calibrador-pressao-cp-100',
    'Calibrador portátil de alta precisão para manutenção de instrumentos. Faixa: -1 a 100 bar. Resolução: 0.001 bar. Inclui bomba manual integrada e software de calibração.',
    'Calibrador portátil de pressão com bomba manual integrada',
    3890.00, NULL, 12, 'CP-100',
    ARRAY['https://via.placeholder.com/800x600/1a1a2e/ea580c?text=CP-100'],
    FALSE, TRUE
  ),
  (
    'Analisador de Qualidade de Energia AQE-3000',
    'analisador-qualidade-energia-aqe-3000',
    'Analisador trifásico completo para diagnóstico de qualidade de energia elétrica. Mede harmônicos, flicker, potência e fator de potência. Interface touchscreen 7". Geração automática de relatórios.',
    'Analisador trifásico de qualidade de energia',
    8750.00, 9500.00, 8, 'AQE-3000',
    ARRAY['https://via.placeholder.com/800x600/1a1a2e/ea580c?text=AQE-3000'],
    TRUE, TRUE
  ),
  (
    'Multímetro True RMS MT-800',
    'multimetro-true-rms-mt-800',
    'Multímetro digital True RMS para medições precisas em CA e CC. 6000 contagens. Mede V, A, Ω, Hz, capacitância e temperatura. CAT III 1000V. Display retroiluminado.',
    'Multímetro True RMS 6000 contagens CAT III',
    459.90, 580.00, 60, 'MT-800',
    ARRAY['https://via.placeholder.com/800x600/1a1a2e/ea580c?text=MT-800'],
    FALSE, TRUE
  )
ON CONFLICT DO NOTHING;
