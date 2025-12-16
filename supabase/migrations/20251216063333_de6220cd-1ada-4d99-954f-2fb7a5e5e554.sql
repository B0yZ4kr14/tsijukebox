-- Create function to automatically assign 'newbie' role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'newbie'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on auth.users to assign default role on signup
-- Note: We create the trigger on user_roles insert instead to avoid modifying auth schema
-- Instead, we'll handle this in application code or use a different approach

-- Alternative: Create a function that can be called to ensure a user has at least one role
CREATE OR REPLACE FUNCTION public.ensure_user_has_role(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If user has no role, assign 'newbie'
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'newbie'::app_role);
  END IF;
END;
$$;