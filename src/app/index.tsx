import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';

// ═══════════════════════════════════════════════════════════════════
//  DEMO / DUMMY DATA — all in one place, easy to replace with
//  real Firebase or ESP32 data later.
//  ⚠️  Motor and Weather are intentionally separate objects.
//      Weather must NEVER affect motor status.
// ═══════════════════════════════════════════════════════════════════
const DEMO_DATA = {
  // ── Motor (comes from ESP32 / Firebase) ──
  motor: {
    isOn: true,                      // true = running, false = stopped
    lastUpdated: '20 Oct 2026, 12:00 PM',
    espConnected: true,              // true = ESP32 online
  },

  // ── Soil moisture (comes from ESP32 sensor) ──
  soil: {
    percentage: 28,                  // 0–100 %
  },

  // ── Weather (comes from weather API, display-only) ──
  weather: {
    temperature: 32,                 // °C
    condition: 'Partly Cloudy',
    humidity: 65,                    // %
    windSpeed: 12,                   // km/h
    chanceOfRain: 20,                // %
    feelsLike: 35,                   // °C
    location: 'Pune, Maharashtra',
    lastUpdated: '20 Oct 2026, 11:45 AM',
  },

  // ── Sunrise / Sunset ──
  sun: {
    sunrise: '6:34 AM',
    sunset: '5:58 PM',
  },
};

// ─── Helper: decide soil moisture status from percentage ───
function getSoilStatus(pct: number) {
  if (pct < 30) return { label: 'Dry', color: '#EF4444', bg: '#7F1D1D' };
  if (pct < 60) return { label: 'Moist', color: '#4ADE80', bg: '#14532D' };
  return { label: 'Very Wet', color: '#60A5FA', bg: '#1E3A5F' };
}

// ═══════════════════════════════════════════════════════════════════
//  HOME SCREEN
// ═══════════════════════════════════════════════════════════════════
export default function HomeScreen() {
  const { motor, soil, weather, sun } = DEMO_DATA;
  const soilStatus = getSoilStatus(soil.percentage);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ───────────────────────────────────────────
              1. HEADER
             ─────────────────────────────────────────── */}
          <View style={styles.header}>
            {/* Gear icon — top-right (absolutely positioned) */}
            <Text style={styles.gearIcon}>⚙️</Text>

            {/* Centred title block */}
            <Text style={styles.headerIcon}>🌾</Text>
            <Text style={styles.headerTitle}>Irrigation App</Text>
            <Text style={styles.headerSub}>Smart Farming, Better Tomorrow</Text>
          </View>

          {/* ───────────────────────────────────────────
              2. DEMO DATA PILL
             ─────────────────────────────────────────── */}
          <View style={styles.demoPill}>
            <Text style={styles.demoPillText}>⚠️  DEMO DATA</Text>
          </View>

          {/* ───────────────────────────────────────────
              3. MOTOR STATUS CARD
             ─────────────────────────────────────────── */}
          <View
            style={[
              styles.card,
              { backgroundColor: motor.isOn ? '#14532D' : '#374151' },
            ]}
          >
            {/* Top section: icon + text + read-only switch */}
            <View style={styles.motorBody}>
              {/* Left: icon + labels */}
              <View style={styles.motorLeft}>
                <Text style={styles.motorPumpIcon}>⏻</Text>
                <View>
                  <Text style={styles.motorTitle}>
                    {motor.isOn ? 'Motor ON' : 'Motor OFF'}
                  </Text>
                  <Text style={styles.motorSub}>
                    {motor.isOn ? 'Irrigation in progress' : 'Irrigation stopped'}
                  </Text>
                </View>
              </View>

              {/* Right: read-only switch indicator (NOT tappable) */}
              <View
                style={[
                  styles.switchTrack,
                  {
                    backgroundColor: motor.isOn ? '#22C55E' : '#6B7280',
                    alignItems: motor.isOn ? 'flex-end' : 'flex-start',
                  },
                ]}
              >
                <View style={styles.switchThumb} />
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Bottom row: Last updated + ESP32 status */}
            <View style={styles.motorFooter}>
              {/* Left: last updated */}
              <View>
                <Text style={styles.footerLabel}>Last updated</Text>
                <Text style={styles.footerValue}>{motor.lastUpdated}</Text>
              </View>
              {/* Right: ESP32 status */}
              <View style={styles.espBlock}>
                <Text style={styles.footerLabel}>ESP32 Status</Text>
                <View style={styles.espRow}>
                  <View
                    style={[
                      styles.espDot,
                      { backgroundColor: motor.espConnected ? '#4ADE80' : '#EF4444' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.footerValue,
                      { color: motor.espConnected ? '#4ADE80' : '#EF4444' },
                    ]}
                  >
                    {motor.espConnected ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ───────────────────────────────────────────
              4. SOIL MOISTURE CARD
             ─────────────────────────────────────────── */}
          <View style={[styles.card, styles.soilCard]}>
            {/* Title row */}
            <View style={styles.rowBetween}>
              <View style={styles.rowCenter}>
                <Text style={styles.cardIcon}>🌿</Text>
                <Text style={styles.cardTitle}>Soil Moisture</Text>
              </View>
              <Text style={styles.infoIcon}>ℹ️</Text>
            </View>

            {/* Big percentage + status pill */}
            <View style={styles.soilValueRow}>
              <Text style={styles.soilPct}>{soil.percentage}%</Text>
              <View style={[styles.statusPill, { backgroundColor: soilStatus.bg }]}>
                <Text style={[styles.statusPillText, { color: soilStatus.color }]}>
                  {soilStatus.label}
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${soil.percentage}%`,
                    backgroundColor: soilStatus.color,
                  },
                ]}
              />
            </View>

            {/* Scale labels */}
            <View style={styles.scaleRow}>
              <Text style={styles.scaleText}>0%{'\n'}Very Dry</Text>
              <Text style={styles.scaleText}>30%{'\n'}Dry</Text>
              <Text style={styles.scaleText}>60%{'\n'}Moist</Text>
              <Text style={[styles.scaleText, { textAlign: 'right' }]}>100%{'\n'}Very Wet</Text>
            </View>
          </View>

          {/* ───────────────────────────────────────────
              5. CURRENT WEATHER CARD
             ─────────────────────────────────────────── */}
          <View style={[styles.card, styles.weatherCard]}>
            {/* Title row + refresh */}
            <View style={styles.rowBetween}>
              <View style={styles.rowCenter}>
                <Text style={styles.cardIcon}>🌤️</Text>
                <Text style={styles.cardTitle}>Current Weather</Text>
              </View>
              <Text style={styles.refreshIcon}>🔄</Text>
            </View>

            {/* Location */}
            <Text style={styles.location}>📍 {weather.location}</Text>

            {/* Big temperature + condition */}
            <View style={styles.tempBlock}>
              <Text style={styles.tempIcon}>☀️</Text>
              <View>
                <Text style={styles.tempValue}>{weather.temperature}°C</Text>
                <Text style={styles.tempCondition}>{weather.condition}</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* 2×2 grid: Humidity, Wind, Rain, Feels Like */}
            <View style={styles.weatherGrid}>
              <View style={styles.weatherGridItem}>
                <Text style={styles.gridIcon}>💧</Text>
                <Text style={styles.gridLabel}>Humidity</Text>
                <Text style={styles.gridValue}>{weather.humidity}%</Text>
              </View>
              <View style={styles.weatherGridItem}>
                <Text style={styles.gridIcon}>💨</Text>
                <Text style={styles.gridLabel}>Wind</Text>
                <Text style={styles.gridValue}>{weather.windSpeed} km/h</Text>
              </View>
              <View style={styles.weatherGridItem}>
                <Text style={styles.gridIcon}>🌧️</Text>
                <Text style={styles.gridLabel}>Chance of Rain</Text>
                <Text style={styles.gridValue}>{weather.chanceOfRain}%</Text>
              </View>
              <View style={styles.weatherGridItem}>
                <Text style={styles.gridIcon}>🌡️</Text>
                <Text style={styles.gridLabel}>Feels Like</Text>
                <Text style={styles.gridValue}>{weather.feelsLike}°C</Text>
              </View>
            </View>

            {/* Last updated */}
            <Text style={styles.weatherTs}>
              Last updated: {weather.lastUpdated}
            </Text>
          </View>

          {/* ───────────────────────────────────────────
              6. SUNRISE / SUNSET CARD
             ─────────────────────────────────────────── */}
          <View style={[styles.card, styles.sunCard]}>
            <View style={styles.sunRow}>
              {/* Sunrise */}
              <View style={styles.sunItem}>
                <Text style={styles.sunIcon}>🌅</Text>
                <Text style={styles.sunLabel}>Sunrise</Text>
                <Text style={styles.sunTime}>{sun.sunrise}</Text>
              </View>

              {/* Vertical separator */}
              <View style={styles.verticalDivider} />

              {/* Sunset */}
              <View style={styles.sunItem}>
                <Text style={styles.sunIcon}>🌇</Text>
                <Text style={styles.sunLabel}>Sunset</Text>
                <Text style={styles.sunTime}>{sun.sunset}</Text>
              </View>
            </View>
          </View>

          {/* Bottom spacer so content doesn't hide behind tab bar */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  // ── Screen & scroll ──
  screen: {
    flex: 1,
    backgroundColor: '#0F172A',        // dark slate background
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 18,
  },

  // ══════════ 1. HEADER ══════════
  header: {
    alignItems: 'center',
    paddingTop: 12,
    position: 'relative',              // so gear can be positioned
  },
  gearIcon: {
    position: 'absolute',
    top: 12,
    right: 0,
    fontSize: 22,
  },
  headerIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  headerSub: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 2,
  },

  // ══════════ 2. DEMO PILL ══════════
  demoPill: {
    alignSelf: 'center',
    backgroundColor: '#78350F',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  demoPillText: {
    color: '#FDE68A',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // ══════════ SHARED CARD ══════════
  card: {
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#FFFFFF1A',
    marginVertical: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  // ══════════ 3. MOTOR CARD ══════════
  motorBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  motorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexShrink: 1,
  },
  motorPumpIcon: {
    fontSize: 34,
    color: '#FFFFFF',
  },
  motorTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  motorSub: {
    color: '#FFFFFFBB',
    fontSize: 14,
    marginTop: 2,
  },
  // Read-only switch (visual only, NOT interactive)
  switchTrack: {
    width: 52,
    height: 30,
    borderRadius: 15,
    padding: 3,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  motorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLabel: {
    color: '#FFFFFF88',
    fontSize: 12,
    marginBottom: 2,
  },
  footerValue: {
    color: '#FFFFFFDD',
    fontSize: 13,
    fontWeight: '600',
  },
  espBlock: {
    alignItems: 'flex-end',
  },
  espRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  espDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ══════════ 4. SOIL MOISTURE CARD ══════════
  soilCard: {
    backgroundColor: '#3B1F0B',        // dark brown
  },
  infoIcon: {
    fontSize: 18,
  },
  soilValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 14,
    marginBottom: 16,
  },
  soilPct: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 58,                    // prevent clipping
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusPillText: {
    fontSize: 14,
    fontWeight: '700',
  },
  // Horizontal progress bar
  progressTrack: {
    height: 10,
    backgroundColor: '#FFFFFF1A',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleText: {
    color: '#FFFFFF77',
    fontSize: 11,
    lineHeight: 15,
  },

  // ══════════ 5. WEATHER CARD ══════════
  weatherCard: {
    backgroundColor: '#1E293B',        // dark navy slate
  },
  refreshIcon: {
    fontSize: 20,
  },
  location: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 14,
  },
  tempBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tempIcon: {
    fontSize: 40,
  },
  tempValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 58,                    // prevent clipping
  },
  tempCondition: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 2,
  },
  // 2×2 grid
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  weatherGridItem: {
    width: '47%',                      // ~half minus gap
    backgroundColor: '#FFFFFF0D',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  gridIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  gridLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 2,
  },
  gridValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  weatherTs: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 14,
  },

  // ══════════ 6. SUNRISE / SUNSET CARD ══════════
  sunCard: {
    backgroundColor: '#1E293B',
  },
  sunRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  sunItem: {
    alignItems: 'center',
  },
  sunIcon: {
    fontSize: 30,
    marginBottom: 4,
  },
  sunLabel: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 2,
  },
  sunTime: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  verticalDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#FFFFFF1A',
  },
});
