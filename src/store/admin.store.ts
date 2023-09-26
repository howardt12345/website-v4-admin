export const useAdminStore = defineStore('admin', () => {
  const config = useRuntimeConfig();

  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const hasUser = computed<boolean>(() => !!user.value);

  const signIn = async (email: string) => {
    if (email !== config.public.ADMIN_EMAIL) {
      alert('You are not authorized to access this page.');
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: config.public.WEBSITE_URL + '/confirm',
      },
    });
    if (error) console.log(error);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    hasUser,
    signIn,
    signOut,
  };
});
