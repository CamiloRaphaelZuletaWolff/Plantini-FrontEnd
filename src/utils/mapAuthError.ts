/**
 * Maps Supabase auth error messages (English, technical) to user-facing
 * Spanish strings. Pure function — no React Native or Supabase imports —
 * so it can be unit-tested in plain Node.
 */
export const mapAuthError = (message: string): string => {
  const m = message.toLowerCase();
  if (m.includes('already registered') || m.includes('user already exists')) {
    return 'Este correo ya está registrado';
  }
  if (m.includes('invalid email')) {
    return 'Correo electrónico inválido';
  }
  if (
    m.includes('password') &&
    (m.includes('characters') || m.includes('short'))
  ) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  if (
    m.includes('invalid login credentials') ||
    m.includes('invalid credentials')
  ) {
    return 'Correo o contraseña incorrectos';
  }
  if (m.includes('email not confirmed')) {
    return 'Por favor confirma tu correo electrónico';
  }
  if (m.includes('disabled') || m.includes('banned')) {
    return 'Esta cuenta ha sido deshabilitada';
  }
  if (m.includes('rate limit') || m.includes('too many requests')) {
    return 'Demasiados intentos fallidos. Intenta más tarde';
  }
  return 'Ocurrió un error. Intenta de nuevo';
};
