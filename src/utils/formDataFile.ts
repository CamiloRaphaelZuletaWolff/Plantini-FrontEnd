import { Platform } from 'react-native';

/** A locally picked file, as returned by expo-image-picker & co. */
export interface FormFileDescriptor {
  uri: string;
  name: string;
  type: string;
}

/**
 * Appends a local file to a multipart `FormData` so it works on every platform.
 *
 * - Native: React Native's `FormData` understands the `{ uri, name, type }`
 *   descriptor and streams the file itself (the DOM types don't model this
 *   shape, hence the cast).
 * - Web: the browser's `FormData` would serialise that object as the string
 *   "[object Object]", so we fetch the `blob:`/`data:` URI the picker returned
 *   and append a real `Blob` with a filename.
 */
export async function appendFormFile(
  form: FormData,
  field: string,
  file: FormFileDescriptor
): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(file.uri)).blob();
    const typed = blob.type ? blob : new Blob([blob], { type: file.type });
    form.append(field, typed, file.name);
    return;
  }

  form.append(field, file as unknown as Blob);
}
