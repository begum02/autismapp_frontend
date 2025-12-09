import BottomQuarterCircle from "@/components/BottomQuarterCircle";
import TopQuarterCircle from "@/components/TopQuarterCircle";
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function SupportRequiredLoginOrRegister() {
  const router = useRouter();
  const handleRegister = () => {
    // Kayıt sayfasına yönlendir
    router.push('/SupportRequiredIndividuals/SupportRequiredRegister');
  };

  const handleLogin = () => {
    // Giriş yap sayfasına yönlendirme
    router.push('/SupportRequiredIndividuals/SupportRequiredLogin');
  };

  const handleGoBack = () => {
    // Geri dön
    console.log('Geri dön tıklandı');
  };

  return (
    <View style={styles.container}>
      
          <TopQuarterCircle style={styles.TopQuarterCircle}/>
            <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
                accessibilityLabel="Geri Dön"
                accessibilityRole="button"
              >
                <Image
                  source={require('../../assets/images/chevron_backward.png')}
                  style={styles.backIcon}
                  resizeMode="contain"
                />
              </Pressable>
      {/* Üst kısım - Logo ve görsel */}
      <Image source={require('../../assets/images/logoindividual.png')} style={styles.LogoStyle} />
     
        {/* Arka plan şekilleri */}
    
        <Image source={require('../../assets/images/Consulting.png')} style={styles.IndividualImage} />
         <Text style={styles.IndividualText}>Sorumlu kişi girişi</Text>
         <Pressable style={styles.Register} onPress={handleRegister}>
           <Text style={styles.RegisterText}>Kaydol</Text>
         
         </Pressable>
           <Pressable style={styles.Login} onPress={handleLogin}>
       
            <Text style={styles.RegisterText}>Giriş Yap</Text>
         </Pressable>
         <BottomQuarterCircle style={styles.BottomQuarterCircle}/>
       
        </View>

);



}

const styles = StyleSheet.create({
  container: {
    position:'relative',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
  },

  TopQuarterCircle: {
    position: "absolute",
    left:-40,
    top:0},
  LogoStyle: {
    position:'relative',
    top:160,
    width: 200,
    height:48},


  IndividualImage: {
    position:'relative',
    top:140,
    marginTop: 40,
    width: 350,
    height: 300,        // numeric height verin (ihtiyaca göre ayarlayın)
    alignSelf: 'center',
    zIndex: 10,
    resizeMode: 'contain',
   },
  IndividualText: {
    fontFamily:'Poppins',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F3C7E',
    position:'relative',
    top:140},
  Register: {
    marginTop: 160,
    width: 286,
    height: 40,
    paddingHorizontal: 15,
    backgroundColor: '#AAAFCA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
   },
  RegisterText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight:700,
    fontFamily: 'Poppins',
    
  },

  BottomQuarterCircle:{
    position: "absolute",
    right:-40,
    bottom:0



  },

  Login: {
      marginTop: 10,
    width: 286,
    height: 40,
    paddingHorizontal: 15,
    backgroundColor: '#2F3C7E',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },  backButton:{
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

