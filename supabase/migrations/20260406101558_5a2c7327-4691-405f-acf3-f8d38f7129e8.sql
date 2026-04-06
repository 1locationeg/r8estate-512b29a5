
-- Add unique constraint on key for upsert
ALTER TABLE public.platform_settings ADD CONSTRAINT platform_settings_key_unique UNIQUE (key);

-- Seed default welcome message
INSERT INTO public.platform_settings (key, value) VALUES
('welcome_message_title', 'مرحباً بك في R8ESTATE! 🎉'),
('welcome_message_body', E'السلام عليكم.. نورت منصة R8ESTATE.\n\nنتمنى أن نقدم لك تجربة مفيدة وممتعة تستحق وقتك الثمين الذي تشرفنا به على المنصة.\n\nنحيطك علماً أن المنصة حالياً في الفترة التجريبية، لذا نرحب جداً باقتراحاتكم للتحسين والتطوير، وكذلك يسعدنا مساعدتكم في حل أي صعوبات واجهتكم أثناء عملية التسجيل أو التقييم أو المشاركة في مجتمع R8ESTATE.\n\nخالص تحياتنا وتقديرنا.. ❤️\n\nيمكنك الاطلاع على تجارب الأعضاء وطرح تساؤلاتك في مجتمعنا عبر الرابط:\n\n[مجتمع R8ESTATE](https://meter.r8estate.com/community)')
ON CONFLICT (key) DO NOTHING;

-- Update trigger function to read from platform_settings
CREATE OR REPLACE FUNCTION public.send_welcome_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _title text;
  _body text;
BEGIN
  SELECT value INTO _title FROM public.platform_settings WHERE key = 'welcome_message_title';
  SELECT value INTO _body FROM public.platform_settings WHERE key = 'welcome_message_body';

  _title := COALESCE(_title, 'مرحباً بك في R8ESTATE! 🎉');
  _body := COALESCE(_body, 'مرحباً بك في منصة R8ESTATE!');

  INSERT INTO public.notifications (user_id, title, type, message)
  VALUES (NEW.user_id, _title, 'welcome', _body);

  RETURN NEW;
END;
$$;
