import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";

export default function TopQuarterCircle({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.quarterCircle, style]} />;
}

const styles = StyleSheet.create({
  quarterCircle: {
    width: 190,
    height: 190,
    backgroundColor: "#AAAFCA",
    borderBottomRightRadius: 190,
  },
});
