import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface PickData {
  id: string;
  company: string;
  added: string;
  removed: string;
  return: number;
  price: number;
  icon: string;
  confidence?: number;
  signalType?: 'bullish' | 'bearish';
}

interface TopPicksCarouselProps {
  title: string;
  badgeText?: string;
  data: PickData[];
  onCardPress?: (symbol: string) => void;
}

export default function TopPicksCarousel({ title, badgeText, data, onCardPress }: TopPicksCarouselProps) {
  const cardWidth = 260;
  const cardSpacing = 16;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {badgeText && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>{badgeText}</Text>
          </View>
        )}
      </View>

      {/* Horizontal Scrollable Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + cardSpacing}
        contentContainerStyle={styles.scrollContent}
      >
        {data.map((pick, index) => (
          <TouchableOpacity
            key={pick.id}
            style={[
              styles.card,
              { width: cardWidth },
              index === 0 && { marginLeft: 0 },
            ]}
            onPress={() => onCardPress?.(pick.id)}
            activeOpacity={0.8}
          >
            {/* Card Content */}
            <View style={styles.cardContent}>
              {/* Header with Symbol */}
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  {pick.icon ? (
                    <Image source={{ uri: pick.icon }} style={styles.stockIcon} />
                  ) : (
                    <View style={[styles.stockIcon, styles.iconPlaceholder]}>
                      <Text style={styles.iconPlaceholderText}>{pick.id.substring(0, 2)}</Text>
                    </View>
                  )}
                  <Text style={styles.symbolText}>{pick.id}</Text>
                </View>
                {pick.signalType && (
                  <View style={[
                    styles.signalBadge,
                    pick.signalType === 'bullish' ? styles.bullishBadge : styles.bearishBadge
                  ]}>
                    <Ionicons 
                      name={pick.signalType === 'bullish' ? 'arrow-up' : 'arrow-down'} 
                      size={16} 
                      color={pick.signalType === 'bullish' ? '#34D399' : '#FF453A'} 
                    />
                  </View>
                )}
              </View>

              {/* Confidence Bar */}
              {pick.confidence !== undefined && (
                <View style={styles.confidenceContainer}>
                  <View style={styles.confidenceBarBg}>
                    <View style={[
                      styles.confidenceBarFill, 
                      { width: `${pick.confidence}%` },
                      pick.signalType === 'bullish' ? styles.bullishBar : styles.bearishBar
                    ]} />
                  </View>
                  <View style={styles.confidenceLabels}>
                    <Text style={styles.confidenceText}>
                      {pick.confidence < 70 ? 'Low' : pick.confidence < 80 ? 'Medium' : 'High'} Signal
                    </Text>
                    <Text style={[
                      styles.confidencePercent,
                      pick.signalType === 'bullish' ? styles.bullishText : styles.bearishText
                    ]}>{pick.confidence}%</Text>
                  </View>
                </View>
              )}

              {/* Bottom Row: Price on Right */}
              <View style={styles.bottomRow}>
                {/* Price in Bottom Right */}
                <View style={styles.priceContainer}>
                  <Text
                    style={[
                      styles.priceText,
                      pick.signalType === 'bullish' ? styles.bullishPrice : styles.bearishPrice,
                    ]}
                  >
                    ${pick.price.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Right edge gradient fade */}
            <LinearGradient
              colors={['transparent', 'rgba(28, 28, 30, 0.8)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rightGradient}
              pointerEvents="none"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  newBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingRight: 20,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    marginRight: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stockIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  iconPlaceholder: {
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPlaceholderText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '700',
  },
  symbolText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  signalBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bullishBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  bearishBadge: {
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
  },
  confidenceContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  confidenceBarBg: {
    height: 4,
    backgroundColor: '#2C2C2E',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  bullishBar: {
    backgroundColor: '#34D399',
  },
  bearishBar: {
    backgroundColor: '#FF453A',
  },
  confidenceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
  },
  confidencePercent: {
    fontSize: 11,
    fontWeight: '700',
  },
  bullishText: {
    color: '#34D399',
  },
  bearishText: {
    color: '#FF453A',
  },
  companySubtext: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 2,
  },
  returnBadge: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  statsList: {
    gap: 6,
  },
  statLine: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B0B0B0',
    lineHeight: 14,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 32,
    fontWeight: '700',
  },
  bullishPrice: {
    color: '#34D399',
  },
  bearishPrice: {
    color: '#FF453A',
  },
  positivePrice: {
    color: '#34D399',
  },
  negativePrice: {
    color: '#FF453A',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 10,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 6,
  },
  returnContainer: {
    marginTop: 12,
  },
  returnText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  positiveReturn: {
    color: '#34D399',
  },
  negativeReturn: {
    color: '#FF453A',
  },
  returnLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  iconContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#34D399',
    opacity: 0.2,
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  iconImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    zIndex: 1,
  },
  rightGradient: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 60,
  },
});
