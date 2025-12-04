import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";

export default function BottomQuarterCircle({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.quarterCircle, style]} />;
}

const styles = StyleSheet.create({
  quarterCircle: {
    width: 190,
    height: 190,
    backgroundColor: "#2F3C7E",
    borderTopLeftRadius: 190,
  },
});
