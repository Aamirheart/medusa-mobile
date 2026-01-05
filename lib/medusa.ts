import Medusa from "@medusajs/js-sdk";
import { Platform } from "react-native";

// 1. Android Emulator uses 10.0.2.2 to see your laptop.
// 2. iOS Simulator uses localhost.
const BACKEND_URL = Platform.select({
  android: "http://localhost:9000/app",
  ios: "http://localhost:9000/app",
  default: "http://localhost:9000/app",
});

console.log("🔌 Connecting to Medusa at:", BACKEND_URL);

export const medusa = new Medusa({
  baseUrl: BACKEND_URL,
  publishableKey: "pk_e3daf218eb487c40b1dc5217e7cb56ec05b6b1f9a8733e599190a7fe7efa3132",
  debug: __DEV__,
})