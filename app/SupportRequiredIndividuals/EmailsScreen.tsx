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
import TopQuarterCircle from '@/components/TopQuarterCircle';
import BottomQuarterCircle from '@/components/BottomQuarterCircle';

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
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
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

      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const currentUser = JSON.parse(userJson);
        setUser(currentUser);
        console.log('✅ User yüklendi:', currentUser.email);
      }

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
      
      if (!response || !response.data) {
        console.error('❌ Response veya data undefined!');
        setInvitations([]);
        return;
      }
      
      let invitationList: Invitation[] = [];
      
      if (response.data.invitations && Array.isArray(response.data.invitations)) {
        invitationList = response.data.invitations;
      } else if (Array.isArray(response.data)) {
        invitationList = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        invitationList = response.data.results;
      } else {
        console.error('❌ Beklenmeyen response formatı:', response.data);
        invitationList = [];
      }
      
      console.log(`✅ ${invitationList.length} davet yüklendi`);
      setInvitations(invitationList);
      
    } catch (error: any) {
      console.error('❌ Davet yükleme hatası:', error);
      setInvitations([]);
      
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      Alert.alert('Hata', 'Lütfen geçerli bir email formatı girin.');
      return;
    }

    setLoading(true);

    try {
      console.log('📧 Davet gönderiliyor:', newEmail.trim());
      
      const requestData = {
        responsible_email: newEmail.trim().toLowerCase(),
      };

      await api.post('/otp/invite/', requestData);

      Alert.alert('Başarılı', 'Davet başarıyla gönderildi!');
      
      setNewEmail('');
      await loadInvitations();

    } catch (error: any) {
      console.error('❌ Davet hatası:', error.response?.data || error.message);
      
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
      
      await api.post('/otp/invite/', {
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

  const handleGoToTasks = () => {
    router.push('/SupportRequiredIndividuals/SupportRequiredTasks');
  };

  const renderInvitationCard = (invitation: Invitation) => {
    const isCodeSent = invitation.status === 'pending' && !invitation.is_expired;
    const isAccepted = invitation.status === 'accepted';
    
    return (
      <View key={invitation.id} style={styles.emailCard}>
        <View style={styles.emailRow}>
          <Text style={styles.emailText}>{invitation.responsible_email}</Text>
          
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

  const acceptedCount = invitations?.filter(inv => inv.status === 'accepted').length || 0;

  return (
    <View style={styles.container}>
      {/* Quarter Circles */}
      <TopQuarterCircle style={styles.TopQuarterCircle} />

      {/* CONTENT */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Sorumlu Kişi Ekle</Text>

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

      {/* Bottom Button - Her zaman göster */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleGoToTasks}
        >
          <Text style={styles.continueButtonText}>Görevlere Git</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <BottomQuarterCircle style={styles.BottomQuarterCircle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  TopQuarterCircle: {
    position: "absolute",
    top: 0,
    left: -40,
  },
  BottomQuarterCircle: {
    position: "absolute",
    right: -40,
    bottom: 0,
  },
  content: {
    flex: 1,
    marginTop: 60,
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
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    zIndex: 10,
  },
  continueButton: {
    height: 55,
    backgroundColor: "#AAAFCA",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});