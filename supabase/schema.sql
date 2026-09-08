-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- 카테고리 테이블
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 상품 테이블
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price integer NOT NULL CHECK (price >= 0),
  stock integer NOT NULL DEFAULT 0,
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  badge text,
  created_at timestamptz DEFAULT now()
);

-- 예약 테이블
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  note text,
  created_at timestamptz DEFAULT now()
);

-- 예약 항목 테이블
CREATE TABLE IF NOT EXISTS reservation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0)
);

-- 약관 테이블
CREATE TABLE IF NOT EXISTS terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  is_required boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- OTP 코드 테이블 (Aligo SMS 인증용)
CREATE TABLE IF NOT EXISTS otp_codes (
  phone text PRIMARY KEY,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS 비활성화 (service_role 키로만 접근)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE terms DISABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes DISABLE ROW LEVEL SECURITY;

-- 동시 예약 방지: 재고 원자적 차감 + 예약 생성
CREATE OR REPLACE FUNCTION create_reservation_atomic(p_user_id uuid, p_note text, p_items jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_id uuid; v_item jsonb; v_n int;
BEGIN
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    UPDATE products
       SET stock = stock - (v_item->>'quantity')::int
     WHERE id = (v_item->>'product_id')::uuid
       AND stock >= (v_item->>'quantity')::int
       AND is_available = true;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    IF v_n = 0 THEN RAISE EXCEPTION 'STOCK_EXHAUSTED:%', v_item->>'product_id'; END IF;
  END LOOP;
  INSERT INTO reservations (user_id, note) VALUES (p_user_id, p_note) RETURNING id INTO v_id;
  INSERT INTO reservation_items (reservation_id, product_id, quantity)
  SELECT v_id, (e.value->>'product_id')::uuid, (e.value->>'quantity')::int
  FROM jsonb_array_elements(p_items) e;
  RETURN jsonb_build_object('id', v_id);
END;
$$;

-- 예약 취소 시 재고 복원
CREATE OR REPLACE FUNCTION restore_stock_on_cancel(p_reservation_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE products p SET stock = p.stock + ri.quantity
  FROM reservation_items ri
  WHERE ri.reservation_id = p_reservation_id AND ri.product_id = p.id;
END;
$$;

-- 관리자 계정 생성 예시 (비밀번호는 앱에서 bcrypt로 해시해서 직접 INSERT)
-- INSERT INTO users (name, phone, password_hash, role) VALUES ('관리자', '01000000000', '$2a$10$...', 'admin');
