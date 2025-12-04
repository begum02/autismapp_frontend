import { Stack } from 'expo-router';
import 'react-native-reanimated';


import { LocaleConfig } from 'react-native-calendars';

LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  dayNamesShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
};
LocaleConfig.defaultLocale = 'tr';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {


  return (

      <Stack screenOptions={{ headerShown: false, presentation: 'card' }}>
        <Stack.Screen name="Splash" />
        <Stack.Screen name="RoleSelection" />
        <Stack.Screen name="./individual/IndividualFollowUp" />
        <Stack.Screen name="./individual/IndividualRegisterOrLogin" />
        <Stack.Screen name="./individual/IndividualRegister" />
        <Stack.Screen name="./individual/IndividualLogin" />
        <Stack.Screen name="./parent/ResponsiblePersonRegisterOrLogin" />
        <Stack.Screen name="./parent/ResponsiblePersonRegister" />
        <Stack.Screen name="./parent/ResponsiblePersonLogin" />
        <Stack.Screen name="./parent/ResponsiblePersonFollowUp" />
        <Stack.Screen name="./SupportRequiredIndividuals/PhoneNumbersScreen.tsx"/>
        <Stack.Screen name="./SupportRequiredIndividuals/SupportRequiredLogin.tsx"/>
        <Stack.Screen name="./SupportRequiredIndividuals/SupportRequiredRegister.tsx"/>
        <Stack.Screen name='./SupportRequiredIndividuals/SupportRequiredLoginOrRegister.tsx'/>
             <Stack.Screen name='./SupportRequiredIndividuals/SupportRequiredTasks.tsx'/>



        

        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="Profile" />
        <Stack.Screen name="Settings" />
      </Stack>

  
  );
}
