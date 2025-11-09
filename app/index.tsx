import * as AutenticacaoLocal from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth, Sair } from './firebaseConfig';

export default function IndexScreen() {
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        biometria();
      } else {
        Sair();
        router.replace('/screens/login');
            }
    });

    async function biometria(){
      const biometria = await AutenticacaoLocal.hasHardwareAsync();
      const biometriaSalva = await AutenticacaoLocal.isEnrolledAsync();

      if (!biometria || !biometriaSalva){
        router.replace('/screens/CourseScreen');

      }
      const resultado = await AutenticacaoLocal.authenticateAsync();
      if (resultado.success){
        router.replace('/screens/CourseScreen');
      } else {
        Sair();
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