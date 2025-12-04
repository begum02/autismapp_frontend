import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ActionMenuProps {
  onComplete?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onClose?: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  onComplete,
  onDelete,
  onEdit,
  onClose,
}) => {
  return (
    <View style={styles.container}>

      {/* Kapatma Butonu */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={24} color="#9CA3AF" />
      </TouchableOpacity>

      <View style={styles.row}>
        {/* Tamamlandı */}
        <TouchableOpacity style={styles.box} onPress={onComplete}>
          <Ionicons name="checkmark-circle" size={28} color="#4ADE80" />
          <Text style={styles.text}>Tamamlandı</Text>
        </TouchableOpacity>

        {/* Sil */}
        <TouchableOpacity style={styles.box} onPress={onDelete}>
          <Ionicons name="trash-outline" size={28} color="#1F2937" />
          <Text style={styles.text}>Sil</Text>
        </TouchableOpacity>

        {/* Düzenle */}
        <TouchableOpacity style={styles.box} onPress={onEdit}>
          <Ionicons name="create-outline" size={28} color="#3B82F6" />
          <Text style={styles.text}>Düzenle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ActionMenu;

const styles = StyleSheet.create({
  container: {
    width: "90%",
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
    position: "relative",
  },

  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  box: {
    width: "30%",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  text: {
    marginTop: 6,
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "600",
  },
});
