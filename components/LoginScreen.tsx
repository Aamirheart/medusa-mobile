import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from './AuthContext';

export default function LoginScreen() {
  const { login, register } = useAuth(); // Use register from context
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // ✅ NEW STATE FOR NAMES
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if(!email || !password) return Alert.alert("Error", "Please fill in all fields");
    if(isSignup && (!firstName || !lastName)) return Alert.alert("Error", "Please enter your full name");

    setLoading(true);
    try {
      if (isSignup) {
        // ✅ PASS REAL DATA TO REGISTER
        await register(email, password, firstName, lastName);
        Alert.alert("Success", "Account created successfully!");
      } else {
        await login(email, password);
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignup ? "Create Account" : "Welcome Back"}</Text>
      
      {/* ✅ CONDITIONAL INPUTS FOR SIGNUP */}
      {isSignup && (
        <View style={{ gap: 15, marginBottom: 15 }}>
          <TextInput 
            placeholder="First Name" 
            value={firstName} 
            onChangeText={setFirstName} 
            style={styles.input} 
          />
          <TextInput 
            placeholder="Last Name" 
            value={lastName} 
            onChangeText={setLastName} 
            style={styles.input} 
          />
        </View>
      )}

      <TextInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none"
        style={styles.input} 
      />
      <TextInput 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
        style={styles.input} 
      />

      <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff"/> : (
          <Text style={styles.btnText}>{isSignup ? "Sign Up" : "Log In"}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
        <Text style={styles.switchText}>
          {isSignup ? "Already have an account? Log In" : "Need an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 8, fontSize: 16, marginBottom: 15 }, // Adjusted margin
  btn: { backgroundColor: '#000', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  switchText: { marginTop: 20, textAlign: 'center', color: '#007AFF' }
});