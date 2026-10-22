import * as SecureStore from "expo-secure-store";
import { assertSecureEntry, type SecureStorage } from "./SecureStorage";

/** Implementação real sobre o `expo-secure-store` (Android e iOS; não existe na web). */
export class DeviceSecureStorage implements SecureStorage {
  getItem(key: string) {
    assertSecureEntry(key);
    return SecureStore.getItemAsync(key);
  }

  setItem(key: string, value: string) {
    assertSecureEntry(key, value);
    return SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  }

  deleteItem(key: string) {
    assertSecureEntry(key);
    return SecureStore.deleteItemAsync(key);
  }
}
