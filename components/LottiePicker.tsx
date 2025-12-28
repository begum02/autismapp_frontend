import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet, Modal, Platform } from "react-native";
import LottieView from "lottie-react-native";

// Animasyon listesi - assets/animations/ klasöründen
const animations = [
  {
    id: "preparing-bag",
    title: "Çanta Hazırla",
    source: require("../assets/animations/preparing-bag.json"),
  },
  {
    id: "brushing-teeth",
    title: "Diş Fırçala",
    source: require("../assets/animations/brushing-teeth.json"),
  },
  {
    id: "plug-device",
    title: "Şarj Et",
    source: require("../assets/animations/plug-device.json"),
  },

  {
    id: "washing-hands",
    title: "El Dezenfekte",
    source: require("../assets/animations/washing-hands.json"),
  },
  {
    id: "shower",
    title: "Duş Al",
    source: require("../assets/animations/shower.json"),
  },
  {
    id: "toilet",
    title: "Tuvalet",
    source: require("../assets/animations/toilet.json"),
  },
  {
    id: "drinking-water",
    title: "Su İç",
    source: require("../assets/animations/drinking-water.json"),
  },
  {
    id: "washing-machine",
    title: "Çamaşır Yıka",
    source: require("../assets/animations/washing-machine.json"),
  },
  {
    id:"relax",
    title:"Mola",
    source:require("../assets/animations/relax.json")

  },
{
   id:"set-table",
   title:"Masayı Hazırla",
   source:require("../assets/animations/set-table.json"),


},

{
  id:"exercise",
  title:"Egzersiz Yap",
  source:require("../assets/animations/exercise.json")

},
{
  id:"sleep",
  title:"Uyku Zamanı",
  source:require("../assets/animations/sleep.json")
}
,
{
  id:"cleaning",
  title:"Temizlik Yap",
  source:require("../assets/animations/cleaning.json")

}


,

{
  id:"trash",
  title:"Çöp At",
  source:require("../assets/animations/trash.json")
},




];

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function LottiePickerModal({ visible, onClose, selectedId, onSelect }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handleBar} />
          <Text style={styles.title}>Animasyon Seç (Opsiyonel)</Text>
          <FlatList
            horizontal
            data={animations}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const selected = item.id === selectedId;
              return (
                <Pressable
                  onPress={() => onSelect(item.id)}
                  style={[styles.item, selected && styles.selected]}
                >
                  <LottieView
                    source={item.source}
                    autoPlay
                    loop
                    style={styles.lottie}
                  />
                  <Text style={styles.text}>{item.title}</Text>
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    minHeight: 320,
    ...Platform.select({
      android: { elevation: 8 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
    }),
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { 
    fontSize: 18, 
    fontWeight: "700", 
    marginBottom: 18,
    color: "#2F3C7E",
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 5,
  },
  item: {
    width: 110,
    height: 130,
    marginRight: 18,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  selected: {
    borderWidth: 3,
    borderColor: "#2F3C7E",
    backgroundColor: "#F5F7FF",
  },
  lottie: {
    width: 80,
    height: 80,
  },
  text: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#2F3C7E",
    textAlign: "center",
    paddingHorizontal: 2,
  },
});
