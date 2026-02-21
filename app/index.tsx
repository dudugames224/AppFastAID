import * as AutenticacaoLocal from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth } from './firebaseConfig';

export default function IndexScreen() {
  const router = useRouter();
  
  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        biometria();
      } else {
        router.replace('/screens/login');
      }
    });

    async function biometria(){
      const hasHardware = await AutenticacaoLocal.hasHardwareAsync();
      const isEnrolled = await AutenticacaoLocal.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        router.replace('../(tabs)/CourseScreen');
        return;
      }
      
      const result = await AutenticacaoLocal.authenticateAsync({ promptMessage: 'Autentique-se para continuar' });
      if (result.success) {

        router.replace('../(tabs)/CourseScreen');
      } else {
        router.replace('/screens/login');
      }
    }
    

    return () => unsubscribe();
  }, [router]); 

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}
