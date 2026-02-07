import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

// Constants for gauge
const GAUGE_RADIUS = 80;
const GAUGE_STROKE = 12;
const GAUGE_WIDTH = GAUGE_RADIUS * 2;
const GAUGE_HEIGHT = GAUGE_RADIUS + GAUGE_STROKE;
const START_ANGLE = Math.PI; // 180 deg (left)
const END_ANGLE = 0;         // 0 deg (right)
const MIN_SCORE = -100;
const MAX_SCORE = 100;

// Color stops for gradient
const COLOR_BEARISH = '#FF453A'; // Red
const COLOR_NEUTRAL = '#FFD600'; // Yellow
const COLOR_BULLISH = '#34D399'; // Green

// Thresholds for label mapping
const STRONGLY_BEARISH = -60;
const BEARISH = -20;
const NEUTRAL = 20;
const BULLISH = 60;

// Helper: Clamp and normalize score to [0,1]
function normalizeScore(score: number): number {
  const clamped = Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));
  // -100 maps to 0, 0 maps to 0.5, +100 maps to 1
  return (clamped - MIN_SCORE) / (MAX_SCORE - MIN_SCORE);
}

// Helper: Map score to label
function getSentimentLabel(score: number): string {
  if (score <= STRONGLY_BEARISH) return 'Strongly Bearish';
  if (score <= BEARISH) return 'Bearish';
  if (score < NEUTRAL) return 'Neutral';
  if (score < BULLISH) return 'Bullish';
  return 'Strongly Bullish';
}

// Helper: Map label to color (for text)
function getLabelColor(score: number): string {
  if (score <= STRONGLY_BEARISH) return COLOR_BEARISH;
  if (score <= BEARISH) return COLOR_BEARISH;
  if (score < NEUTRAL) return COLOR_NEUTRAL;
  if (score < BULLISH) return COLOR_BULLISH;
  return COLOR_BULLISH;
}

// Helper: Describe arc path for SVG
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  // Convert polar to cartesian
  const polarToCartesian = (angle: number) => {
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 1, end.x, end.y
  ].join(' ');
}

interface SentimentGaugeProps {
  score: number; // -100 to +100
}

const SentimentGauge: React.FC<SentimentGaugeProps> = ({ score }) => {
  // Animated value for smooth arc transitions
  const animated = useRef(new Animated.Value(normalizeScore(score))).current;
  const prevScore = useRef(score);

  useEffect(() => {
    if (prevScore.current !== score) {
      Animated.timing(animated, {
        toValue: normalizeScore(score),
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
      prevScore.current = score;
    }
  }, [score]);

  // Memoize arc path for background (full arc)
  const arcPath = useMemo(() =>
    describeArc(
      GAUGE_RADIUS,
      GAUGE_RADIUS,
      GAUGE_RADIUS - GAUGE_STROKE / 2,
      START_ANGLE,
      END_ANGLE
    ),
    []
  );

  // Animated arc for fill
  const animatedPath = useMemo(() => {
    // Interpolate angle based on animated value
    return animated.interpolate({
      inputRange: [0, 1],
      outputRange: [START_ANGLE, END_ANGLE],
    });
  }, [animated]);

  // Render animated arc using react-native-svg
  const RenderAnimatedArc = () => {
    // We use Animated for the angle, but SVG Path must be static, so we use a listener
    const [endAngle, setEndAngle] = React.useState(START_ANGLE);
    useEffect(() => {
      const id = animated.addListener(({ value }) => {
        setEndAngle(START_ANGLE + (END_ANGLE - START_ANGLE) * value);
      });
      return () => animated.removeListener(id);
    }, [animated]);
    const path = describeArc(
      GAUGE_RADIUS,
      GAUGE_RADIUS,
      GAUGE_RADIUS - GAUGE_STROKE / 2,
      START_ANGLE,
      endAngle
    );
    return (
      <Path
        d={path}
        stroke="url(#gaugeGradient)"
        strokeWidth={GAUGE_STROKE}
        fill="none"
        strokeLinecap="round"
      />
    );
  };

  // Label and color
  const label = getSentimentLabel(score);
  const labelColor = getLabelColor(score);

  return (
    <View style={styles.container}>
      <Svg width={GAUGE_WIDTH} height={GAUGE_HEIGHT}>
        <Defs>
          <LinearGradient id="gaugeGradient" x1={0} y1={0} x2={1} y2={0}>
            <Stop offset={0} stopColor={COLOR_BEARISH} />
            <Stop offset={0.5} stopColor={COLOR_NEUTRAL} />
            <Stop offset={1} stopColor={COLOR_BULLISH} />
          </LinearGradient>
        </Defs>
        {/* Background arc (gray) */}
        <Path
          d={arcPath}
          stroke="#232323"
          strokeWidth={GAUGE_STROKE}
          fill="none"
          strokeLinecap="round"
        />
        {/* Animated arc */}
        <RenderAnimatedArc />
      </Svg>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default SentimentGauge;
