import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TopPicksCarousel({ title, badgeText, data }) {
  const cardWidth = 300;
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
          <View
            key={pick.id}
            style={[
              styles.card,
              { width: cardWidth },
              index === 0 && { marginLeft: 0 },
            ]}
          >
            {/* Card Content */}
            <View style={styles.cardContent}>
              {/* Left side - Text content */}
              <View style={styles.textContainer}>
                <Text style={styles.companyName}>{pick.company}</Text>
                <Text style={styles.dateText}>{pick.added}</Text>
                <Text style={styles.dateText}>{pick.removed}</Text>
                <View style={styles.returnContainer}>
                  <Text
                    style={[
                      styles.returnText,
                      pick.return >= 0 ? styles.positiveReturn : styles.negativeReturn,
                    ]}
                  >
                    {pick.return >= 0 ? '+' : ''}
                    {pick.return.toFixed(1)}%
                  </Text>
                  <Text style={styles.returnLabel}>Total Return</Text>
                </View>
              </View>

              {/* Right side - Icon with glow */}
              <View style={styles.iconContainer}>
                <View style={styles.glowCircle} />
                <Image source={pick.icon} style={styles.iconImage} />
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
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
