import { mapAuthError } from '../mapAuthError';

describe('mapAuthError', () => {
  it.each([
    ['User already registered', 'Este correo ya está registrado'],
    ['user already exists', 'Este correo ya está registrado'],
    ['Invalid email', 'Correo electrónico inválido'],
    [
      'Password should be at least 6 characters',
      'La contraseña debe tener al menos 6 caracteres',
    ],
    ['password too short', 'La contraseña debe tener al menos 6 caracteres'],
    ['Invalid login credentials', 'Correo o contraseña incorrectos'],
    ['Email not confirmed', 'Por favor confirma tu correo electrónico'],
    ['User has been disabled', 'Esta cuenta ha sido deshabilitada'],
    ['banned', 'Esta cuenta ha sido deshabilitada'],
    ['rate limit exceeded', 'Demasiados intentos fallidos. Intenta más tarde'],
    [
      'Too many requests',
      'Demasiados intentos fallidos. Intenta más tarde',
    ],
  ])('maps "%s" to its Spanish equivalent', (raw, expected) => {
    expect(mapAuthError(raw)).toBe(expected);
  });

  it('is case-insensitive', () => {
    expect(mapAuthError('INVALID EMAIL')).toBe('Correo electrónico inválido');
  });

  it('returns a generic fallback when the message is unknown', () => {
    expect(mapAuthError('Some unexpected backend hiccup')).toBe(
      'Ocurrió un error. Intenta de nuevo',
    );
  });

  it('does NOT misclassify a generic message containing "password" without a length cue', () => {
    expect(mapAuthError('Your password was used')).toBe(
      'Ocurrió un error. Intenta de nuevo',
    );
  });
});
