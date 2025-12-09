import BottomQuarterCircle from "@/components/BottomQuarterCircle";
import TopQuarterCircle from "@/components/TopQuarterCircle";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from 'react-native-paper';
export default function RoleSelection() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Icon source="chevron-left" size={24} color="#ffffffff" />
      <TopQuarterCircle style={styles.TopQuarterCircle} />
         <Pressable
      style={styles.backButton}
      onPress={() => router.back()}
      accessibilityLabel="Geri Dön"
      accessibilityRole="button"
    >
      <Image
        source={require('../assets/images/chevron_backward.png')}
        style={styles.backIcon}
        resizeMode="contain"
      />
    </Pressable>
  <View style={styles.ButtonsContainer}>
      <Pressable
        style={styles.button}
        onPress={() => router.push("/parent/ResponsiblePersonRegisterOrLogin")}
        accessibilityRole="button">
        <Image source={require('../assets/images/parentteacher.png')} style={styles.image} />
        <Text style={styles.buttonText}>Ebeveyn/Öğretmen</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/individual/IndividualRegisterOrLogin")}
        accessibilityRole="button"
      >
        <Image source={require('../assets/images/individual2.png')} style={styles.image}/>
        <Text style={[styles.buttonText, { paddingHorizontal: 50 }]}>Bireysel</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/SupportRequiredIndividuals/SupportRequiredLoginOrRegister")}
        accessibilityRole="button"
      >
          <Image source={require('../assets/images/Consulting.png')} style={styles.image}/>
        <Text style={styles.buttonText}>Destek Gereksinimi Olan Birey</Text>
      </Pressable>

      <BottomQuarterCircle style={styles.BottomQuarterCircle} />
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  TopQuarterCircle: {
    position: "absolute",
    left:-40,
    top:0

  },
  BottomQuarterCircle: {
    position: "absolute",
    right:-60,
    bottom:-200
  },
  ButtonsContainer: {
    position:'relative',
    top:150
  },
  container: {
    position: "relative",
    width: "100%",
    height: "100%",

    paddingHorizontal: 20,
  },
  button: {
    width:349,
    height:174,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEDEDE",
    borderRadius: 8,
    flexDirection:"row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginVertical: 10,
  },
  image:{
    marginLeft:10,
    marginTop:10,
  },

  buttonText: {
    fontSize: 20,
    color: "#2F3C7E",
    fontFamily:'Poppins',
    fontWeight:'800',
    marginTop:50,
    marginRight:10,
  
    flexShrink: 1,     // uzun metnin sığması için küçülmeyi sağlar
    flexWrap: 'wrap',  // metnin alt satıra geçmesini sağlar
    maxWidth: 200,     // gerektiğinde ayarla (buton genişliğine göre)
    alignSelf: 'flex-start'


  },
  backButton:{
    zIndex:10,
    width:60,
    height:60,
    position: "absolute",
    left:20,
    top:40
  },
  backIcon:{
    width:'100%',
    height:'100%'
  }

});
