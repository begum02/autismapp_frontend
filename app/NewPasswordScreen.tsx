import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";

export default function NewPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = params.role as string;

  const handleChangePassword = async () => {
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    } 
    // Şifre kurallarını burada kontrol edebilirsin
    // await authService.changePassword(password);
    if (role === 'individual') {
      router.push('/individual/IndividualLogin');
    } else if (role === 'responsible_person') {
      router.push('/parent/ResponsiblePersonLogin');
    } else if (role === 'support_required_individual') {
      router.push('/SupportRequiredIndividuals/SupportRequiredLogin');
    } else {
      setError('Geçersiz kullanıcı rolü');
    }
  };          

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityLabel="Geri Dön"
        accessibilityRole="button"
      >
        <Image
          source={require('../assets/images/chevron_backward.png')}
          style={styles.backIcon}
        />
      </Pressable>

      <Image
        source={require('../assets/images/logoindividual.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Yeni Şifre Oluştur</Text>
      <Text style={styles.desc}>
        Şifreniz en az 8 karakter olmalıdır.{"\n"}
        En az bir büyük harf içermelidir.{"\n"}
        En az bir küçük harf içermelidir.{"\n"}
        En az bir rakam veya özel karakter içermelidir.
      </Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Yeni Şifre"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#AEADAD"
        />
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Şifreyi Onayla"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor="#AEADAD"
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Onayla</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    justifyContent: "flex-start",
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 40,
    width: 40,
    height: 40,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    width: 24,   // veya 28, 32 gibi küçük bir değer
    height: 24,
    resizeMode: "contain",
  },
  logo: {
    width: 180,
    height: 48,
    marginBottom: 24,
    marginTop: 24,
  },
  title: {
    fontFamily: "Poppins",
    fontSize: 24,
    fontWeight: "bold",
    color: "#2F3C7E",
    marginBottom: 12,
    textAlign: "center",
  },
  desc: {
    color: "#AEADAD",
    fontSize: 14,
    textAlign: "left",
    marginBottom: 24,
    fontFamily: "Poppins",
    alignSelf: "stretch",
  },
  inputWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#2F3C7E",
    fontFamily: "Poppins",
    backgroundColor: "transparent",
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    width: "100%",
    height: 48,
    backgroundColor: "#BFC2D9",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Poppins",
  },
  error: {
    color: "red",
    marginBottom: 8,
    marginTop: -8,
    alignSelf: "flex-start",
  },
});


