
CREATE OR REPLACE FUNCTION public.send_welcome_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, type, message)
  VALUES (
    NEW.user_id,
    'مرحباً بك في R8ESTATE! 🎉',
    'welcome',
    E'السلام عليكم\nنورت منصة R8ESTATE\nو نتمنى أن نقدم لك تجربة مفيدة ممتعة تستاهل وقتك الثمين اللى اتشرفنا به على المنصة. نحيطك علماً ان المنصة فى الفترة التجريبية..لذا نرحب باقتراحاتكم للتحسين والتطوير وكذلك حل كل ما واجهته من صعوبات اثناء عملية التسجيل او التقييم او المشاركة فى مجتمع R8ESTATE.\n\nخالص تحياتنا وتقديرنا ❤️\n\nيمكنك الإطلاع على تجارب الأعضاء و سؤالهم عما يدور بخاطرك فى مجتمع R8ESTATE:\nhttps://meter.r8estate.com/community'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_welcome ON public.profiles;

CREATE TRIGGER on_profile_created_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_notification();
