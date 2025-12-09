import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Ana Sayfalar */}
      <Stack.Screen name="index" />
      <Stack.Screen name="Splash" />
      <Stack.Screen name="RoleSelection" />

      {/* Individual Screens */}
      <Stack.Screen name="individual/IndividualRegisterOrLogin" />
      <Stack.Screen name="individual/IndividualRegister" />
      <Stack.Screen name="individual/IndividualLogin" />
      <Stack.Screen name="individual/IndividualFollowUp" />

      {/* Responsible Person (Parent) Screens */}
      <Stack.Screen name="parent/ResponsiblePersonRegisterOrLogin" />
      <Stack.Screen name="parent/ResponsiblePersonRegister" />
      <Stack.Screen name="parent/ResponsiblePersonLogin" />
      <Stack.Screen name="parent/ResponsiblePersonFollowUp" />

      {/* Support Required Individuals Screens */}
      {/* ✅ YENİ İSİM */}
      <Stack.Screen name="SupportRequiredIndividuals/SupportRequiredLoginOrRegister" />
      <Stack.Screen name="SupportRequiredIndividuals/SupportRequiredRegister" />
      <Stack.Screen name="SupportRequiredIndividuals/SupportRequiredLogin" />
      <Stack.Screen name="SupportRequiredIndividuals/EmailsScreen" />

      {/* Diğer */}
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="Profile" />
      <Stack.Screen name="Settings" />
    </Stack>
  );
}
