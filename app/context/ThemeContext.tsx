import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import getThemedStyles from '../styles'; // Nossa função de estilos

// 1. Definimos o tipo de dados que nosso contexto irá fornecer
interface ThemeContextType {
  currentTheme: 'light' | 'dark';
  setCurrentTheme: (theme: 'light' | 'dark') => void;
  styles: ReturnType<typeof getThemedStyles>['styles'];
  panicStyles: ReturnType<typeof getThemedStyles>['panicStyles'];
  lessonstyles: ReturnType<typeof getThemedStyles>['lessonstyles'];
  colors: ReturnType<typeof getThemedStyles>['colors'];
}

// 2. Criamos o Contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 3. Criamos o componente Provedor (Provider)
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(deviceTheme || 'light');

  // useMemo garante que os estilos só sejam recalculados quando o tema mudar.
  const themeValue = useMemo(() => {
    const { styles, panicStyles, colors , lessonstyles} = getThemedStyles(currentTheme);
    return { currentTheme, setCurrentTheme, styles, panicStyles, colors, lessonstyles };
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// 4. Criamos um Hook personalizado para consumir o contexto facilmente
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};