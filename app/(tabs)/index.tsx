import { useAuth } from '@/components/AuthContext'; // Import Auth
import LoginScreen from '@/components/LoginScreen'; // Import Login
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { medusa } from '@/lib/medusa';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const { customer, loading: authLoading, logout } = useAuth();
  
  const [products, setProducts] = useState<any[]>([]);
  const [region, setRegion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. IF NOT LOGGED IN, SHOW LOGIN SCREEN
  if (authLoading) return <ActivityIndicator style={{flex:1}} />;
  if (!customer) return <LoginScreen />;

  // 2. IF LOGGED IN, FETCH INDIA STORE
  useEffect(() => {
    async function initIndiaStore() {
      try {
        // A. Find "India" Region
        const { regions } = await medusa.store.region.list();
        const india = regions.find(r => r.currency_code === 'inr');
        
        if (!india) {
          Alert.alert("Config Error", "Please create an 'India' region in Admin Panel");
          return;
        }
        setRegion(india);

        // B. Fetch Products FOR INDIA (This ensures INR prices)
        const { products } = await medusa.store.product.list({
          region_id: india.id, 
          fields: "id,title,thumbnail,variants.prices,variants.id",
        });
        setProducts(products);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    initIndiaStore();
  }, [customer]);

  // Helper: Format Price to ₹
  const getINRPrice = (variant: any) => {
    const price = variant?.prices?.find((p: any) => p.currency_code === 'inr');
    return price 
      ? `₹${(price.amount / 100).toFixed(2)}` 
      : "Price N/A (Check Admin)";
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">Hello, {customer.first_name}</ThemedText>
        <TouchableOpacity onPress={logout}>
           <ThemedText style={{color: 'red'}}>Log Out</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedText type="title" style={{padding: 16}}>🇮🇳 India Store</ThemedText>
      
      {loading ? <ActivityIndicator /> : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <ThemedView style={styles.card}>
              <Image source={{ uri: item.thumbnail }} style={styles.image} />
              <ThemedView style={{padding: 10}}>
                <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                <ThemedText style={{color: 'green', fontSize: 16}}>
                  {getINRPrice(item.variants[0])}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  card: { marginBottom: 15, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
  image: { width: '100%', height: 200 }
});