import * as AutenticacaoLocal from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth } from './firebaseConfig';

export default function IndexScreen() {
  const router = useRouter();
  
  useEffect(() => {
    // Verifica o estado da autenticação do Firebase ao carregar o app.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Se existe um usuário logado, tenta a autenticação por biometria.
        biometria();
      } else {
        // Se não há usuário, vai para a tela de login.
        router.replace('/screens/login');
      }
    });

    async function biometria(){
      const hasHardware = await AutenticacaoLocal.hasHardwareAsync();
      const isEnrolled = await AutenticacaoLocal.isEnrolledAsync();

      // Se o dispositivo não tem biometria, permite o acesso direto.
      if (!hasHardware || !isEnrolled) {
        router.replace('../(tabs)/CourseScreen');
        return;
      }
      
      const result = await AutenticacaoLocal.authenticateAsync({ promptMessage: 'Autentique-se para continuar' });
      if (result.success) {
        // Se a biometria for bem-sucedida, vai para a tela principal.
        router.replace('../(tabs)/CourseScreen');
      } else {
        // Se a biometria falhar ou for cancelada, o usuário não é deslogado.
        // Apenas redirecionamos para a tela de login para que ele possa
        // inserir a senha manualmente.
        router.replace('/screens/login');
      }
    }
    

    return () => unsubscribe();
  }, []); 

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}