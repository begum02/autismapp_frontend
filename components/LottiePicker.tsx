import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
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
];

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function LottiePicker({ selectedId, onSelect }: Props) {
  return (
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: { 
    fontSize: 16, 
    fontWeight: "600", 
    marginLeft: 5, 
    marginBottom: 10,
    color: "#333",
  },
  listContent: {
    paddingHorizontal: 5,
  },
  item: {
    width: 100,
    height: 120,
    marginRight: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selected: {
    borderWidth: 3,
    borderColor: "#2F3C7E",
    backgroundColor: "#F5F7FF",
  },
  lottie: {
    width: 70,
    height: 70,
  },
  text: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 2,
  },
});
