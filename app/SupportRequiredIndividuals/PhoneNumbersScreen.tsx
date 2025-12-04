import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function PhoneNumbersScreen() {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <Icon name="arrow-back-ios-new" size={26} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Telefon Numaralarınızı Ekleyin</Text>

        <View style={styles.headerIcon} />
      </View>

      {/* CONTENT */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ADD PHONE SECTION */}
        <View style={styles.section}>
          <Text style={styles.label}>Telefon Numarası</Text>

          <View style={styles.phoneInputWrapper}>
            <Text style={styles.phonePrefix}>+90</Text>

            <TextInput
              placeholder="5xx xxx xx xx"
              placeholderTextColor="#999"
              style={styles.phoneInput}
            />
          </View>

          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Numara Ekle</Text>
          </TouchableOpacity>
        </View>

        {/* LIST TITLE */}
        <Text style={styles.listTitle}>Eklenen Numaralar</Text>

        {/* ITEM 1 – Onaylanmadı */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <View style={styles.row}>
              <View style={styles.iconCirclePrimary}>
                <Icon name="phone-iphone" size={22} color="#2F3C7E" />
              </View>

              <View>
                <Text style={styles.phoneText}>+90 555 123 45 67</Text>
                <Text style={styles.statusText}>Onaylanmadı</Text>
              </View>
            </View>

            <View style={styles.row}>
              <TouchableOpacity style={styles.smallIconButton}>
                <Icon name="edit" size={20} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.smallIconButton}>
                <Icon name="delete" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>SMS Kodu Gönder</Text>
          </TouchableOpacity>
        </View>

        {/* ITEM 2 – Kod Gönderildi */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <View style={styles.row}>
              <View style={styles.iconCirclePrimary}>
                <Icon name="phone-iphone" size={22} color="#2F3C7E" />
              </View>

              <View>
                <Text style={styles.phoneText}>+90 555 987 65 43</Text>
                <Text style={styles.statusText}>Doğrulama kodu gönderildi</Text>
              </View>
            </View>

            <View style={styles.row}>
              <TouchableOpacity style={styles.smallIconButton}>
                <Icon name="edit" size={20} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.smallIconButton}>
                <Icon name="delete" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.codeRow}>
            <TextInput
              placeholder="Doğrulama Kodu"
              placeholderTextColor="#999"
              style={styles.codeInput}
            />

            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Doğrula</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ITEM 3 – Doğrulandı */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <View style={styles.row}>
              <View style={styles.iconCircleGreen}>
                <Icon name="verified-user" size={22} color="green" />
              </View>

              <View>
                <Text style={styles.phoneText}>+90 555 345 12 89</Text>
                <Text style={styles.verifiedText}>Doğrulandı</Text>
              </View>
            </View>

            <View style={styles.row}>
              <TouchableOpacity style={styles.smallIconButton}>
                <Icon name="edit" size={20} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.smallIconButton}>
                <Icon name="delete" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* BOTTOM BUTTON */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.primaryBottomButton}>
          <Text style={styles.primaryBottomButtonText}>Devam Et</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* MAIN */
  container: { flex: 1, backgroundColor: "#f6f6f8" },

  /* HEADER */
  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f6f8",
  },
  headerIcon: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "bold" },

  /* CONTENT */
  content: { padding: 16 },

  /* SECTIONS */
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },

  /* TEXTS */
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  listTitle: { fontSize: 12, marginLeft: 8, marginBottom: 6, color: "#666" },

  /* INPUTS */
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  phonePrefix: {
    position: "absolute",
    left: 14,
    zIndex: 1,
    color: "#666",
  },
  phoneInput: {
    height: 50,
    flex: 1,
    paddingLeft: 50,
    fontSize: 16,
  },

  codeRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  codeInput: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 16,
  },

  /* BUTTONS */
  primaryButton: {
    backgroundColor: "#2F3C7E",
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#2F3C7E",
    backgroundColor: "#e6e9f5",
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  secondaryButtonText: { color: "#2F3C7E", fontWeight: "700" },

  /* LIST ITEMS */
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },

  iconCirclePrimary: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2F3C7E20",
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleGreen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,200,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  phoneText: { fontSize: 16, fontWeight: "600" },
  statusText: { color: "#777", fontSize: 13 },
  verifiedText: { color: "green", fontWeight: "600", fontSize: 13 },

  smallIconButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },

  /* BOTTOM FIXED BUTTON */
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#f6f6f8",
  },
  primaryBottomButton: {
    height: 55,
    backgroundColor: "#2F3C7E",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBottomButtonText: { color: "#fff", fontWeight: "700", fontSize: 18 },
});
