import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { medusa } from '@/lib/medusa';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, StyleSheet } from 'react-native';

export default function HomeScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        console.log("Attempting to fetch products...");
        
        // 1. Fetch products from Medusa
        // We removed the crashing 'clientOptions' log
        const { products } = await medusa.store.product.list({
          fields: "id,title,thumbnail,variants.prices", 
          limit: 10,
        });

        console.log("Success! Products found:", products.length);
        setProducts(products);
      } catch (error: any) {
        console.error("Fetch Error:", error);
        
        let msg = "Check your backend console.";
        if (error.message?.includes("Network request failed")) {
             msg = Platform.OS === 'android' 
             ? "Android cannot connect to localhost. Ensure lib/medusa.ts uses 'http://10.0.2.2:9000'"
             : "Ensure your backend is running on port 9000.";
        }
        Alert.alert("Connection Failed", msg);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <ThemedText style={{marginTop: 10}}>Connecting to Medusa...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Latest Drops</ThemedText>
      
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 16, padding: 16 }}
        renderItem={({ item }) => (
          <ThemedView style={styles.card}>
            <Image 
              source={{ uri: item.thumbnail }} 
              style={styles.image} 
              contentFit="cover"
              transition={1000}
            />
            <ThemedView style={styles.textContainer}>
                <ThemedText type="subtitle">{item.title}</ThemedText>
                <ThemedText style={{color: '#aaa'}}>
                {item.variants?.[0]?.prices?.[0]?.amount 
                    ? `$${item.variants[0].prices[0].amount / 100}` 
                    : "Price N/A"}
                </ThemedText>
            </ThemedView>
          </ThemedView>
        )}
        ListEmptyComponent={
          <ThemedText style={{textAlign: 'center', marginTop: 20}}>
            No products found.{"\n"}
            Check your Admin Dashboard to ensure products are Published!
          </ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#1C1C1E', 
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  image: {
    width: '100%',
    height: 250,
  },
  textContainer: {
    padding: 12,
  }
});