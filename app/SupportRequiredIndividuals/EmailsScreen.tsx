import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';

// ============= TYPES =============
interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: string;
}

interface Invitation {
  id: number;
  support_required_user: number;
  responsible_email: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  accepted_at: string | null;
  is_expired: boolean;
}

export default function EmailsScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [invitations, setInvitations] = useState<Invitation[]>([]); // ✅ Başlangıç değeri boş array
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Token kontrolü
      const token = await AsyncStorage.getItem('access_token');
      console.log('🔍 Token kontrolü:', token ? 'VAR ✅' : 'YOK ❌');
      
      if (!token) {
        Alert.alert('Hata', 'Önce giriş yapmalısınız', [
          { 
            text: 'Giriş Yap', 
            onPress: () => router.push('/SupportRequiredIndividuals/SupportRequiredLogin') 
          }
        ]);
        return;
      }

      // User bilgisini al
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const currentUser = JSON.parse(userJson);
        setUser(currentUser);
        console.log('✅ User yüklendi:', currentUser.email);
      }

      // Davetleri yükle
      await loadInvitations();
    } catch (error) {
      console.error('❌ Auth kontrolü hatası:', error);
    }
  };

  const loadInvitations = async () => {
    try {
      setRefreshing(true);
      console.log('📥 Davetler yükleniyor...');
      
      const response = await api.get('/otp/invitations/');
      
      console.log('✅ Response alındı:', response);
      console.log('✅ Response data:', JSON.stringify(response.data, null, 2));
      
      // ✅ Response yapısını kontrol et
      if (!response || !response.data) {
        console.error('❌ Response veya data undefined!');
        setInvitations([]);
        return;
      }
      
      // Backend'den gelen yapıya göre ayarla
      let invitationList: Invitation[] = [];
      
      if (response.data.invitations && Array.isArray(response.data.invitations)) {
        // Backend: { invitations: [...], stats: {...} }
        invitationList = response.data.invitations;
        console.log('📊 Stats:', response.data.stats);
      } else if (Array.isArray(response.data)) {
        // Backend: [...]
        invitationList = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        // Backend: { results: [...], count: X } (paginated)
        invitationList = response.data.results;
      } else {
        console.error('❌ Beklenmeyen response formatı:', response.data);
        invitationList = [];
      }
      
      console.log(`✅ ${invitationList.length} davet yüklendi`);
      setInvitations(invitationList);
      
    } catch (error: any) {
      console.error('❌ Davet yükleme hatası:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      
      setInvitations([]); // Hata durumunda boş array
      
      // Kullanıcıya hata göster
      if (error.response?.status === 401) {
        Alert.alert('Hata', 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', [
          { text: 'Giriş Yap', onPress: () => router.push('/SupportRequiredIndividuals/SupportRequiredLogin') }
        ]);
      } else if (error.response?.data?.detail) {
        Alert.alert('Hata', error.response.data.detail);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddEmail = async () => {
    if (!newEmail.trim()) {
      Alert.alert('Hata', 'Lütfen geçerli bir email adresi girin.');
      return;
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      Alert.alert('Hata', 'Lütfen geçerli bir email formatı girin.');
      return;
    }

    setLoading(true);

    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 DAVET GÖNDERME BAŞLADI');
      console.log('📧 Email:', newEmail.trim());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        Alert.alert('Hata', 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        router.push('/SupportRequiredIndividuals/SupportRequiredLogin');
        return;
      }

      console.log('🔑 Token var:', !!token);
      
      // ✅ Backend'in TAM OLARAK beklediği format
      const requestData = {
        responsible_email: newEmail.trim().toLowerCase(),
      };
      
      console.log('📦 Gönderilecek data:', JSON.stringify(requestData, null, 2));

      // ✅ API çağrısı
      const response = await api.post('/otp/invite/', requestData);

      console.log('✅ Davet başarılı!');
      console.log('📥 Response:', response.data);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      Alert.alert('Başarılı', 'Davet başarıyla gönderildi!');
      
      setNewEmail('');
      
      // ✅ DÜZELT: fetchInvitations() → loadInvitations()
      await loadInvitations();

    } catch (error: any) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ DAVET HATASI');
      console.error('❌ Error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error config:', error.config);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.responsible_email?.[0] ||
                          error.message || 
                          'Davet gönderilemedi';
      
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (invitation: Invitation) => {
    try {
      setLoading(true);
      
      console.log('🔄 Kod yeniden gönderiliyor:', invitation.responsible_email);
      
      const response = await api.post('/otp/invite/', {
        responsible_email: invitation.responsible_email,
      });
      
      Alert.alert('✅ Başarılı', `${invitation.responsible_email} adresine kod yeniden gönderildi`);
      
      await loadInvitations();
    } catch (error: any) {
      console.error('❌ Kod gönderme hatası:', error.response?.data || error.message);
      Alert.alert('❌ Hata', 'Kod gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmail = (invitation: Invitation) => {
    Alert.alert(
      'Email Sil',
      `${invitation.responsible_email} adresini silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            Alert.alert('Bilgi', 'Silme özelliği yakında eklenecek');
          },
        },
      ]
    );
  };

  const renderInvitationCard = (invitation: Invitation) => {
    const isCodeSent = invitation.status === 'pending' && !invitation.is_expired;
    const isAccepted = invitation.status === 'accepted';
    
    return (
      <View key={invitation.id} style={styles.emailCard}>
        {/* Email Address */}
        <View style={styles.emailRow}>
          <Text style={styles.emailText}>{invitation.responsible_email}</Text>
          
          {/* Edit & Delete Icons */}
          <View style={styles.iconButtons}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => Alert.alert('Bilgi', 'Düzenleme özelliği yakında eklenecek')}
            >
              <Ionicons name="pencil" size={18} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => handleDeleteEmail(invitation)}
            >
              <Ionicons name="trash-outline" size={18} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Button */}
        {isAccepted ? (
          <View style={styles.acceptedButton}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.acceptedButtonText}>Kod Doğrulandı</Text>
          </View>
        ) : isCodeSent ? (
          <View style={styles.codeSentContainer}>
            <View style={styles.codeSentButton}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
              <Text style={styles.codeSentButtonText}>Kod Gönderildi</Text>
            </View>
            <Text style={styles.verificationNote}>
              Doğrulama kodu sorumlu kişinin email adresine gönderildi. 
              Lütfen sorumlu kişinin emailindeki bağlantıyı kullanarak doğrulamayı bekleyin.
            </Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.sendCodeButton}
            onPress={() => handleSendCode(invitation)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#2F3C7E" />
            ) : (
              <Text style={styles.sendCodeButtonText}>Kodu Gönder</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ✅ Array kontrolleri - invitations undefined olabilir
  const acceptedCount = invitations?.filter(inv => inv.status === 'accepted').length || 0;
  const hasPendingInvitations = invitations?.some(
    inv => inv.status === 'pending' && !inv.is_expired
  ) || false;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2F3C7E" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Ionicons name="time-outline" size={24} color="#FFD700" />
          <Text style={styles.headerTitle}>PlanBuddy</Text>
        </View>
        
        <View style={{ width: 40 }} />
      </View>

      {/* CONTENT */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={loadInvitations}
      >
        {/* Title */}
        <Text style={styles.pageTitle}>Sorumlu Kişi Ekle</Text>

        {/* New Email Input */}
        <View style={styles.addEmailSection}>
          <TextInput
            style={styles.emailInput}
            placeholder="Yeni Sorumlu Email"
            placeholderTextColor="#999"
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddEmail}
            disabled={loading || !newEmail.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>Email Ekle</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Email List */}
        {invitations && invitations.length > 0 ? (
          <>
            {invitations.map(renderInvitationCard)}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="mail-outline" size={64} color="#DDD" />
            <Text style={styles.emptyText}>Henüz sorumlu kişi eklemediniz</Text>
            <Text style={styles.emptySubtext}>
              Yukarıdaki alana email adresi girerek başlayın
            </Text>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM BUTTON */}
      {acceptedCount > 0 && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => {
              Alert.alert('Başarılı', `${acceptedCount} sorumlu kişi eklendi`, [
                { text: 'Tamam', onPress: () => router.back() }
              ]);
            }}
          >
            <Text style={styles.continueButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2F3C7E",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2F3C7E",
    marginBottom: 24,
    textAlign: "center",
  },
  addEmailSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emailInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: "#F9F9F9",
    marginBottom: 12,
    color: "#333",
  },
  addButton: {
    height: 50,
    backgroundColor: "#AAAFCA",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  emailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  emailText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  iconButtons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  sendCodeButton: {
    height: 44,
    backgroundColor: "#AAAFCA",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sendCodeButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  codeSentContainer: {
    gap: 12,
  },
  codeSentButton: {
    height: 44,
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  codeSentButtonText: {
    color: "#4CAF50",
    fontSize: 15,
    fontWeight: "700",
  },
  verificationNote: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  acceptedButton: {
    height: 44,
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  acceptedButtonText: {
    color: "#4CAF50",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#BBB",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  continueButton: {
    height: 55,
    backgroundColor: "#2F3C7E",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});