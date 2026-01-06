import Medusa from "@medusajs/js-sdk";
import { Platform } from "react-native";

// Export this so AuthContext can use it
export const BACKEND_URL = Platform.select({
  android: "http://10.0.2.2:9000", // Standard Android Emulator IP
  ios: "http://localhost:9000",
  default: "http://localhost:9000",
});

export const medusa = new Medusa({
  baseUrl: BACKEND_URL,
  publishableKey: "pk_e3daf218eb487c40b1dc5217e7cb56ec05b6b1f9a8733e599190a7fe7efa3132",
  debug: __DEV__,
});