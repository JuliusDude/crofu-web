# CroFu Mobile App (.apk) — Complete Technical Specification

> **Target Platform**: Android (.apk) & iOS via React Native + Expo SDK 51/52  
> **Goal**: Build a standalone, mobile-optimized version of the CroFu Agricultural Price Forecasting Engine.  
> **Scope**: Includes Dashboard Analytics, Interactive SVG Time-Series Chart, Multi-Model Benchmarks, Mandi Regional Data, Risk Indicators, and Alert Configurator. **NO LANDING PAGE IS INCLUDED**.  
> **Design Philosophy**: Identical color palette, typography tokens, dark/light theme switching, and high-end visual elegance optimized for mobile touch interactions.

---

## 1. Project Dependencies (`package.json`)

```json
{
  "name": "crofu-mobile",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "build:apk": "eas build -p android --profile preview"
  },
  "dependencies": {
    "expo": "~51.0.0",
    "expo-font": "~12.0.0",
    "expo-status-bar": "~1.12.0",
    "expo-haptics": "~13.0.0",
    "react": "18.2.0",
    "react-native": "0.74.5",
    "react-native-gesture-handler": "~2.16.1",
    "react-native-reanimated": "~3.10.1",
    "react-native-svg": "15.2.0",
    "lucide-react-native": "^0.469.0",
    "nativewind": "^2.0.11"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/react": "~18.2.45",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.3.2"
  }
}
```

---

## 2. Design System & Theme Mapping (`constants/theme.ts`)

```typescript
export interface ThemeTokens {
  bg: string;
  surface: string;
  ink: string;
  inkSecondary: string;
  border: string;
  brand: string;
  sage: string;
  gold: string;
  positive: string;
  negative: string;
  fontSerif: string;
  fontSans: string;
  fontMono: string;
}

export const LIGHT_THEME: ThemeTokens = {
  bg: '#f6f2e7',
  surface: '#ffffff',
  ink: '#1c231e',
  inkSecondary: '#5c6659',
  border: '#e3ddcb',
  brand: '#204a38',
  sage: '#7c9c7f',
  gold: '#b8872e',
  positive: '#4c7a52',
  negative: '#b85c42',
  fontSerif: 'Fraunces-Bold',
  fontSans: 'IBMPlexSans-Regular',
  fontMono: 'IBMPlexMono-Regular',
};

export const DARK_THEME: ThemeTokens = {
  bg: '#0f1613',
  surface: '#171f1a',
  ink: '#ece7d9',
  inkSecondary: '#93a090',
  border: '#2a342d',
  brand: '#3e8b63',
  sage: '#8fb08f',
  gold: '#e0ac4c',
  positive: '#5fa26a',
  negative: '#d97b5c',
  fontSerif: 'Fraunces-Bold',
  fontSans: 'IBMPlexSans-Regular',
  fontMono: 'IBMPlexMono-Regular',
};
```

---

## 3. Typographic App Logo Component (`components/AppLogo.tsx`)

The CroFu logo is **pure typography** (`CroFu.`), rendered identically to the web app with a serif font and signature gold dot.

```tsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { ThemeTokens } from '../constants/theme';

export default function AppLogo({ fontSize = 26, theme }: { fontSize?: number; theme: ThemeTokens }) {
  return (
    <Text style={[styles.logoText, { fontSize, color: theme.ink }]}>
      CroFu<Text style={{ color: theme.gold }}>.</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  logoText: {
    fontFamily: 'Fraunces-Bold',
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
});
```

---

## 4. Mock Master Datasets & Calculation Logic (`data/masterData.ts`)

```typescript
export interface CommodityMeta {
  key: string;
  label: string;
  image: any;
  unitQuintal: number;
  championModel: string;
  mape: number;
  rmse: number;
  mae: number;
  r2: number;
  dirAccuracy: number;
  trainDuration: string;
  lastRetrained: string;
  seasonStatus: string;
  seasonIndex: string;
  volatilityLevel: string;
  surplusIndex: string;
}

export const COMMODITIES: Record<string, CommodityMeta> = {
  tomato: {
    key: 'tomato',
    label: 'Tomato',
    image: require('../assets/tomatoes.jpg'),
    unitQuintal: 2320,
    championModel: 'XGBoost V3',
    mape: 6.4,
    rmse: 142,
    mae: 108,
    r2: 0.941,
    dirAccuracy: 91.2,
    trainDuration: '14.2s',
    lastRetrained: '2026-08-01',
    seasonStatus: 'Peak Harvest Window',
    seasonIndex: '1.12x',
    volatilityLevel: 'Moderate Volatility Warning',
    surplusIndex: '-4.2%',
  },
  onion: {
    key: 'onion',
    label: 'Onion',
    image: require('../assets/onion.jpg'),
    unitQuintal: 1950,
    championModel: 'ARIMA (2,1,2)',
    mape: 5.1,
    rmse: 118,
    mae: 89,
    r2: 0.958,
    dirAccuracy: 93.5,
    trainDuration: '8.6s',
    lastRetrained: '2026-08-02',
    seasonStatus: 'Storage Release Window',
    seasonIndex: '0.95x',
    volatilityLevel: 'Low Volatility',
    surplusIndex: '+2.1%',
  },
  potato: {
    key: 'potato',
    label: 'Potato',
    image: require('../assets/potato.jpg'),
    unitQuintal: 1680,
    championModel: 'ARIMA (1,1,1)',
    mape: 4.3,
    rmse: 95,
    mae: 72,
    r2: 0.965,
    dirAccuracy: 94.8,
    trainDuration: '6.1s',
    lastRetrained: '2026-08-03',
    seasonStatus: 'Post-Harvest Cold Store',
    seasonIndex: '0.98x',
    volatilityLevel: 'Low Volatility',
    surplusIndex: '+5.4%',
  },
  brinjal: {
    key: 'brinjal',
    label: 'Brinjal',
    image: require('../assets/brinjal.png'),
    unitQuintal: 2100,
    championModel: 'XGBoost V2',
    mape: 7.8,
    rmse: 168,
    mae: 128,
    r2: 0.912,
    dirAccuracy: 88.4,
    trainDuration: '12.9s',
    lastRetrained: '2026-07-31',
    seasonStatus: 'Sowing & Early Arrival',
    seasonIndex: '1.05x',
    volatilityLevel: 'High Price Volatility Warning',
    surplusIndex: '-8.1%',
  },
};

export function generateSeries(basePrice: number) {
  const history = [];
  const forecast = [];
  const now = new Date(2026, 7, 4);

  let p = basePrice - 300;
  for (let i = 30; i >= 1; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    p += (Math.random() - 0.46) * 45;
    const actual = Math.round(p);
    const ma7 = Math.round(actual * 0.98 + 30);
    const arrival = Math.round(4000 + Math.sin(i) * 1200 + Math.random() * 500);
    history.push({ date: dateStr, actual, ma7, arrival });
  }

  let fcP = p;
  for (let i = 1; i <= 30; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    fcP += (Math.random() - 0.44) * 35;
    const predicted = Math.round(fcP);
    const lower = Math.round(predicted - (60 + i * 2.5));
    const upper = Math.round(predicted + (65 + i * 2.8));
    const arrival = Math.round(4200 + Math.cos(i) * 900);
    forecast.push({ date: dateStr, predicted, lower, upper, arrival });
  }

  return { history, forecast, currentObserved: Math.round(p) };
}
```

---

## 5. Mobile Component Specifications

### 5.1 Serene Anthropic-Style Splash Screen (`components/SplashScreen.tsx`)
Features a 2.5s unhurried splash screen displaying the raw text **`CroFu.`** logo with serene status text cross-fades and smooth `scale` zoom into the main dashboard.

```tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import AppLogo from './AppLogo';
import { DARK_THEME } from '../constants/theme';

const PHRASES = [
  'Fetching market data...',
  'Analyzing time-series models...',
  'Preparing your workspace...',
];

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const logoScale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev < PHRASES.length - 1 ? prev + 1 : prev));
    }, 1200);

    const timer = setTimeout(() => {
      logoScale.value = withTiming(12, { duration: 900, easing: Easing.bezier(0.65, 0, 0.35, 1) });
      opacity.value = withTiming(0, { duration: 700 });
      setTimeout(onComplete, 950);
    }, 2800);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <AppLogo fontSize={52} theme={DARK_THEME} />
      </Animated.View>
      <Text style={styles.phraseText}>{PHRASES[phraseIndex]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1613', justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center' },
  phraseText: { marginTop: 24, fontFamily: 'IBMPlexMono-Regular', fontSize: 12, color: '#93a090', letterSpacing: 1 },
});
```

---

## 6. APK Compilation Guide

To compile the application into a standalone `.apk` for distribution:

```bash
# 1. Install Expo EAS CLI
npm install -g eas-cli

# 2. Login to Expo Account
eas login

# 3. Configure Build Settings
eas build:configure

# 4. Trigger Standalone Android APK Build
eas build -p android --profile preview
```

Upon build completion, EAS CLI generates a direct download link for the output `.apk` file.
