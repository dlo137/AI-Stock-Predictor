import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const portfolioHoldings = [
  { symbol: 'AAPL', shares: 10, avgPrice: 165.50, currentPrice: 178.50 },
  { symbol: 'GOOGL', shares: 5, avgPrice: 135.20, currentPrice: 142.30 },
  { symbol: 'MSFT', shares: 8, avgPrice: 350.00, currentPrice: 378.91 },
  { symbol: 'NVDA', shares: 3, avgPrice: 450.00, currentPrice: 495.22 },
];

export default function PortfolioScreen() {
  const calculateTotalValue = () => {
    return portfolioHoldings.reduce(
      (total, holding) => total + holding.shares * holding.currentPrice,
      0
    );
  };

  const calculateTotalGainLoss = () => {
    return portfolioHoldings.reduce(
      (total, holding) =>
        total + holding.shares * (holding.currentPrice - holding.avgPrice),
      0
    );
  };

  const calculateGainLossPercent = () => {
    const totalInvested = portfolioHoldings.reduce(
      (total, holding) => total + holding.shares * holding.avgPrice,
      0
    );
    return ((calculateTotalGainLoss() / totalInvested) * 100).toFixed(2);
  };

  const totalValue = calculateTotalValue();
  const totalGainLoss = calculateTotalGainLoss();
  const isPositive = totalGainLoss >= 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Portfolio Value</Text>
          <Text style={styles.summaryValue}>${totalValue.toFixed(2)}</Text>
          <View style={styles.gainLossContainer}>
            <Text style={[styles.gainLoss, isPositive ? styles.positive : styles.negative]}>
              {isPositive ? '+' : ''}${totalGainLoss.toFixed(2)}
            </Text>
            <Text style={[styles.gainLossPercent, isPositive ? styles.positive : styles.negative]}>
              ({isPositive ? '+' : ''}
              {calculateGainLossPercent()}%)
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Holdings</Text>

          {portfolioHoldings.map((holding, index) => {
            const currentValue = holding.shares * holding.currentPrice;
            const investedValue = holding.shares * holding.avgPrice;
            const gainLoss = currentValue - investedValue;
            const gainLossPercent = ((gainLoss / investedValue) * 100).toFixed(2);
            const holdingPositive = gainLoss >= 0;

            return (
              <TouchableOpacity key={index} style={styles.holdingCard}>
                <View style={styles.holdingHeader}>
                  <Text style={styles.holdingSymbol}>{holding.symbol}</Text>
                  <Text style={styles.holdingValue}>${currentValue.toFixed(2)}</Text>
                </View>

                <View style={styles.holdingDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Shares:</Text>
                    <Text style={styles.detailValue}>{holding.shares}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Avg Price:</Text>
                    <Text style={styles.detailValue}>${holding.avgPrice.toFixed(2)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Current:</Text>
                    <Text style={styles.detailValue}>${holding.currentPrice.toFixed(2)}</Text>
                  </View>
                </View>

                <View style={styles.holdingFooter}>
                  <Text
                    style={[
                      styles.holdingGainLoss,
                      holdingPositive ? styles.positive : styles.negative,
                    ]}
                  >
                    {holdingPositive ? '+' : ''}${gainLoss.toFixed(2)} ({holdingPositive ? '+' : ''}
                    {gainLossPercent}%)
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add New Position</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    padding: 20,
    backgroundColor: '#000000',
  },
  summaryCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    marginBottom: 25,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  gainLossContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  gainLoss: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  gainLossPercent: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  holdingCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  holdingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  holdingSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  holdingValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  holdingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  holdingFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  holdingGainLoss: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positive: {
    color: '#34D399',
  },
  negative: {
    color: '#FF453A',
  },
  addButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#34D399',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34D399',
  },
});
