# Smart Weather-Synced Precision Irrigation System

An IoT-based irrigation system where an ESP32 microcontroller reads soil moisture from a sensor and controls a water pump locally based on threshold values. The companion Android app (built with Expo / React Native) displays the motor status (ON/OFF), real-time soil moisture percentage, and current weather conditions — all fetched over Firebase. **Weather data is display-only and never affects the motor state**; the pump is controlled solely by the ESP32 based on soil moisture readings.

## Tech Stack

- **App**: Expo SDK 57 / React Native (TypeScript)
- **Hardware**: ESP32 + Soil Moisture Sensor + Relay Module + Water Pump
- **Backend**: Firebase Realtime Database

## Getting Started

```bash
# Install dependencies
npm install

# Start the Expo dev server
npx expo start
```

Scan the QR code with **Expo Go** on your Android phone, or press `w` to open in a web browser.
