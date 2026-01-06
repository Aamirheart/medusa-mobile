import { useAuth } from '@/components/AuthContext';
import LoginScreen from '@/components/LoginScreen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { medusa } from '@/lib/medusa';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const { customer, loading: authLoading, logout } = useAuth();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Wait for Auth Check
  if (authLoading) return <ActivityIndicator style={{flex:1}} />;
  
  // 2. If no user, show Login
  if (!customer) return <LoginScreen />;

  // 3. Fetch Data
  useEffect(() => {
    async function fetchData() {
      try {
        // Get India Region
        const { regions } = await medusa.store.region.list();
        const india = regions.find(r => r.currency_code === 'inr');
        
        if (!india) return Alert.alert("Error", "India region not found in backend");

        // Get Products (SDK now has the Token from AuthContext automatically)
        const { products } = await medusa.store.product.list({
          region_id: india.id,
          fields: "id,title,thumbnail,variants.prices"
        });
        setProducts(products);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [customer]);

  const getPrice = (variant: any) => {
    const p = variant?.prices?.find((p: any) => p.currency_code === 'inr');
    return p ? `₹${p.amount}` : "N/A";
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">Hi, {customer.first_name}</ThemedText>
        <TouchableOpacity onPress={logout}><ThemedText style={{color:'red'}}>Log Out</ThemedText></TouchableOpacity>
      </ThemedView>

      <ThemedText type="title" style={{padding: 16}}>Dashboard</ThemedText>

      {loading ? <ActivityIndicator/> : (
        <FlatList
          data={products}
          keyExtractor={i => i.id}
          contentContainerStyle={{padding:16}}
          renderItem={({item}) => (
            <ThemedView style={styles.card}>
                <Image source={{uri: item.thumbnail}} style={styles.image} contentFit="cover"/>
                <ThemedView style={{padding:10}}>
                    <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                    <ThemedText style={{color:'green'}}>{getPrice(item.variants[0])}</ThemedText>
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