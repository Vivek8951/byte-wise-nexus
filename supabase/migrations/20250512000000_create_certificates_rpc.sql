
-- Create RPC function to get certificates
CREATE OR REPLACE FUNCTION public.get_user_certificates(p_user_id UUID)
RETURNS SETOF certificates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM certificates
  WHERE user_id = p_user_id;
END;
$$;

