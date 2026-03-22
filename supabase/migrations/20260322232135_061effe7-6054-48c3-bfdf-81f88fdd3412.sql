
CREATE OR REPLACE FUNCTION public.notify_launch_watchers()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _watcher uuid;
  _meta jsonb;
  _title text;
  _message text;
  _units_pct numeric;
BEGIN
  _meta := jsonb_build_object(
    'launch_id', NEW.id,
    'project_name', NEW.project_name,
    'link', '/launch-watch'
  );

  -- Phase change
  IF OLD.current_phase IS DISTINCT FROM NEW.current_phase THEN
    _title := '🚀 Phase Update: ' || NEW.project_name;
    _message := NEW.project_name || ' has moved to Phase ' || NEW.current_phase || '. Price is now EGP ' || COALESCE(NEW.current_price_per_m2::text, 'N/A') || '/m².';
    
    FOR _watcher IN SELECT user_id FROM public.launch_watchlist WHERE launch_id = NEW.id
    LOOP
      PERFORM public.create_notification(_watcher, 'announcement', _title, _message, _meta);
    END LOOP;
  END IF;

  -- Price change
  IF OLD.current_price_per_m2 IS DISTINCT FROM NEW.current_price_per_m2 AND OLD.current_phase IS NOT DISTINCT FROM NEW.current_phase THEN
    _title := '💰 Price Change: ' || NEW.project_name;
    _message := NEW.project_name || ' price updated from EGP ' || COALESCE(OLD.current_price_per_m2::text, 'N/A') || ' to EGP ' || COALESCE(NEW.current_price_per_m2::text, 'N/A') || '/m².';
    
    FOR _watcher IN SELECT user_id FROM public.launch_watchlist WHERE launch_id = NEW.id
    LOOP
      PERFORM public.create_notification(_watcher, 'announcement', _title, _message, _meta);
    END LOOP;
  END IF;

  -- Units drop below 20%
  IF NEW.total_units > 0 THEN
    _units_pct := (NEW.units_remaining::numeric / NEW.total_units::numeric) * 100;
    IF _units_pct < 20 AND ((OLD.units_remaining::numeric / GREATEST(OLD.total_units, 1)::numeric) * 100) >= 20 THEN
      _title := '⚠️ Low Units: ' || NEW.project_name;
      _message := 'Only ' || NEW.units_remaining || ' units remaining out of ' || NEW.total_units || ' (' || ROUND(_units_pct) || '%). Act fast!';
      
      FOR _watcher IN SELECT user_id FROM public.launch_watchlist WHERE launch_id = NEW.id
      LOOP
        PERFORM public.create_notification(_watcher, 'announcement', _title, _message, _meta);
      END LOOP;
    END IF;
  END IF;

  -- Status change (e.g. launch date confirmed, sold out)
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    _title := '📢 ' || NEW.project_name || ' Status Update';
    _message := NEW.project_name || ' is now "' || REPLACE(NEW.status::text, '_', ' ') || '".';
    
    FOR _watcher IN SELECT user_id FROM public.launch_watchlist WHERE launch_id = NEW.id
    LOOP
      PERFORM public.create_notification(_watcher, 'announcement', _title, _message, _meta);
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_launch_watchers
  AFTER UPDATE ON public.launches
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_launch_watchers();
