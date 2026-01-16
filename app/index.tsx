import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Card components for the 2x2 grid
const LineGraphCard = ({ tall, title }: { tall?: boolean; title?: string }) => {
  // Generate evenly spaced dot grid with gradient effect
  const renderDotGrid = () => {
    const dots = [];
    const spacing = 15; // Space between dots
    const rows = tall ? 18 : 8;
    const cols = 10;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Calculate gradient: top rows are gray, bottom rows are bright green
        const progress = row / (rows - 1); // 0 at top, 1 at bottom

        // Smooth transition from desaturated gray to bright saturated green
        const grayR = 136, grayG = 136, grayB = 136; // #888888
        const greenR = 52, greenG = 211, greenB = 153; // #34D399

        const r = Math.round(grayR + (greenR - grayR) * progress);
        const g = Math.round(grayG + (greenG - grayG) * progress);
        const b = Math.round(grayB + (greenB - grayB) * progress);

        const color = `rgb(${r}, ${g}, ${b})`;
        const opacity = 0.15 + (progress * 0.45); // Gradually increase opacity from 0.15 to 0.6

        dots.push(
          <Circle
            key={`${row}-${col}`}
            cx={col * spacing + 15}
            cy={row * spacing + 15}
            r={2}
            fill={color}
            opacity={opacity}
          />
        );
      }
    }
    return dots;
  };

  // Smooth curved line path with peaks and valleys, ending with exponential growth
  const smoothPath = tall
    ? `M 10,240 C 25,220 35,200 45,210 C 55,220 65,190 75,180 C 85,170 95,185 105,175 C 115,165 120,150 125,140 C 130,120 135,90 145,70 C 150,55 153,45 155,40`
    : `M 10,110 C 25,95 35,85 45,90 C 55,95 65,75 75,70 C 85,65 95,75 105,65 C 115,55 120,48 128,40 C 135,30 142,25 148,22`;

  return (
    <View style={tall ? styles.cardTall : styles.card}>
      {title && <Text style={styles.cardTitle}>{title}</Text>}
      <Svg width="100%" height="100%" viewBox={tall ? "0 0 160 296" : "0 0 160 140"} style={{ position: 'absolute' }}>
        {/* Dot grid background */}
        {renderDotGrid()}

        {/* Smooth curved line */}
        <Path
          d={smoothPath}
          stroke="#34D399"
          strokeWidth={7}
          strokeOpacity={0.65}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

const RadarChartCard = ({ title }: { title?: string }) => (
  <View style={styles.card}>
    {title && <Text style={styles.cardTitle}>{title}</Text>}
    <View style={styles.radarContainer}>
      <View style={[styles.radarHex, { width: 60, height: 60, opacity: 0.3 }]} />
      <View style={[styles.radarHex, { width: 40, height: 40, opacity: 0.5 }]} />
      <View style={[styles.radarHex, { width: 20, height: 20, opacity: 0.8 }]} />
      <View style={styles.radarCenter} />
    </View>
  </View>
);

const ScoreCard = ({ score, title }: { score: number; title?: string }) => (
  <View style={styles.card}>
    {title && <Text style={styles.cardTitle}>{title}</Text>}
    <Text style={styles.scoreNumber}>{score}</Text>
    <Text style={styles.scoreLabel}>Score</Text>
  </View>
);

const IconCard = ({ icon, label, title }: { icon: string; label: string; title?: string }) => (
  <View style={styles.card}>
    {title && <Text style={styles.cardTitle}>{title}</Text>}
    <Text style={styles.cardIcon}>{icon}</Text>
    <Text style={styles.cardLabel}>{label}</Text>
  </View>
);

const BarChartCard = () => (
  <View style={styles.card}>
    <View style={styles.barChartContainer}>
      <View style={[styles.bar, { height: 30 }]} />
      <View style={[styles.bar, { height: 50 }]} />
      <View style={[styles.bar, { height: 25 }]} />
      <View style={[styles.bar, { height: 45 }]} />
      <View style={[styles.bar, { height: 35 }]} />
    </View>
  </View>
);

const TrendCard = () => (
  <View style={styles.card}>
    <View style={styles.trendContainer}>
      <Text style={styles.trendArrow}>↗</Text>
      <Text style={styles.trendPercent}>+24%</Text>
    </View>
  </View>
);

// Onboarding data structure
const onboardingScreens = [
  {
    title: 'Trade with confidence',
    subtitle: 'AI clarity for every stock move',
    cards: [
      { type: 'line', component: () => <LineGraphCard tall={true} title="Stock Price" /> },
      { type: 'score', component: () => <ScoreCard score={94} title="Long-Term Signals" /> },
      { type: 'icon', component: () => <IconCard icon="📊" label="Analysis" title="Short-Term Signals" /> },
      { type: 'radar', component: RadarChartCard },
    ],
  },
  {
    title: 'Let AI Handle the Hard Part',
    subtitle: 'You focus on the trade—AI handles the analysis.',
    cards: [
      { type: 'bar', component: BarChartCard },
      { type: 'trend', component: TrendCard },
      { type: 'icon', component: () => <IconCard icon="🎯" label="Target" /> },
      { type: 'score', component: () => <ScoreCard score={87} /> },
    ],
  },
  {
    title: 'Trade with confidence, Not guesswork.',
    subtitle: 'Get clear unbiased AI signals on any stock.',
    cards: [
      { type: 'radar', component: RadarChartCard },
      { type: 'line', component: LineGraphCard },
      { type: 'score', component: () => <ScoreCard score={92} /> },
      { type: 'icon', component: () => <IconCard icon="⚡" label="Speed" /> },
    ],
  },
];

export default function OnboardingScreen() {
  const [currentScreen, setCurrentScreen] = useState(0);

  const handleNext = () => {
    if (currentScreen < onboardingScreens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      // Navigate to paywall after onboarding
      router.replace('/paywall');
    }
  };

  const handleSkip = () => {
    // Navigate to paywall when skipping
    router.replace('/paywall');
  };

  const screen = onboardingScreens[currentScreen];
  const isFirstScreen = currentScreen === 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main content area */}
      <View style={styles.content}>
        {/* App name and icon - above grid */}
        <View style={styles.appHeader}>
          <Image
            source={require('../assets/app-icon.png')}
            style={styles.appIcon}
          />
          <Text style={styles.appName}>Bullish Bearish Signals</Text>
        </View>
        {/* Grid of cards - first screen has tall first column */}
        {isFirstScreen ? (
          <View style={styles.gridContainer}>
            <View style={styles.gridRowSpecial}>
              {/* Left column - spans 2 rows */}
              <View style={styles.gridItemTall}>{screen.cards[0].component({})}</View>

              {/* Right column - 2 cards stacked */}
              <View style={styles.gridColumn}>
                <View style={styles.gridItemSmall}>{screen.cards[1].component({})}</View>
                <View style={styles.gridItemSmall}>{screen.cards[2].component({})}</View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>{screen.cards[0].component({})}</View>
              <View style={styles.gridItem}>{screen.cards[1].component({})}</View>
            </View>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>{screen.cards[2].component({})}</View>
              <View style={styles.gridItem}>{screen.cards[3].component({})}</View>
            </View>
          </View>
        )}

        {/* Text section */}
        <View style={styles.textSection}>
          <Text style={styles.headline}>{screen.title}</Text>
          <Text style={styles.subtitle}>{screen.subtitle}</Text>
        </View>
      </View>

      {/* Footer with continue button and pagination */}
      <View style={styles.footer}>
        {/* Continue button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleNext}>
          <Text style={styles.continueText}>
            {currentScreen === onboardingScreens.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
        </TouchableOpacity>

        {/* Pagination dots */}
        <View style={styles.pagination}>
          {onboardingScreens.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentScreen && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 60,
    paddingBottom: 40,
  },
  skipContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  skipText: {
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '500',
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 12,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'flex-start',
  },
  gridContainer: {
    marginBottom: 48,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
  gridRowSpecial: {
    flexDirection: 'row',
    height: 296,
    gap: 12,
  },
  gridItemTall: {
    flex: 1,
  },
  gridColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },
  gridItemSmall: {
    height: 140,
  },
  card: {
    backgroundColor: '#181818',
    borderRadius: 20,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTall: {
    backgroundColor: '#181818',
    borderRadius: 20,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    position: 'absolute',
    top: 12,
    left: 12,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    zIndex: 10,
    backgroundColor: '#181818',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },

  // Line graph styles
  graphContainer: {
    width: '80%',
    height: 80,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  lineGraphPath: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  graphPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2D8659',
    position: 'absolute',
  },
  graphLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#333',
  },

  // Radar chart styles
  radarContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  radarHex: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#2D8659',
    borderRadius: 8,
    transform: [{ rotate: '45deg' }],
  },
  radarCenter: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2D8659',
  },

  // Score card styles
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },

  // Icon card styles
  cardIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },

  // Bar chart styles
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    gap: 8,
  },
  bar: {
    width: 10,
    backgroundColor: '#2D8659',
    borderRadius: 4,
  },

  // Trend card styles
  trendContainer: {
    alignItems: 'center',
  },
  trendArrow: {
    fontSize: 48,
    color: '#34C759',
    marginBottom: 4,
  },
  trendPercent: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
  },

  // Text section styles
  textSection: {
    paddingHorizontal: 0,
  },
  headline: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
  },

  // Footer styles
  footer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333333',
  },
  activeDot: {
    backgroundColor: '#2D8659',
    width: 24,
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  continueText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000000',
  },
});
