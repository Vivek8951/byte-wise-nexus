
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

-- Create another RPC function to get a certificate by user_id and course_id
CREATE OR REPLACE FUNCTION public.get_certificate(p_user_id UUID, p_course_id UUID)
RETURNS SETOF certificates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM certificates
  WHERE user_id = p_user_id AND course_id = p_course_id;
END;
$$;

-- Create a create_certificates_table function for backward compatibility
CREATE OR REPLACE FUNCTION public.create_certificates_table()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- The table should already exist now, this is just a placeholder
  RETURN;
END;
$$;
