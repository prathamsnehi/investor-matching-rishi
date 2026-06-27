import storage from "@react-native-firebase/storage";

/**
 * Uploads a founder's pitch deck (local file uri from expo-document-picker) to
 * Firebase Storage and returns the public download URL.
 *
 * Stored under `pitch_decks/<userId>/<filename>`. The returned URL is currently
 * kept client-side only — the backend onboarding schema has no pitch-deck field
 * yet (see docs/todo.md). Wire it to the backend once an endpoint exists.
 *
 * Requires a native build with GoogleService-Info.plist / google-services.json
 * present (does not work in Expo Go).
 */
export async function uploadPitchDeck(
  localUri: string,
  userId: string,
  originalName?: string,
): Promise<string> {
  const safeName = (originalName || `deck-${Date.now()}.pdf`).replace(/[^\w.\-]/g, "_");
  const path = `pitch_decks/${userId}/${Date.now()}_${safeName}`;

  const ref = storage().ref(path);
  await ref.putFile(localUri);
  return ref.getDownloadURL();
}
