
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CheckboxProps {
  label: string; 
  value: boolean; 
  onValueChange: (newValue: boolean) => void; 
  style?: object; 
}


const Checkbox: React.FC<CheckboxProps> = ({ label, value, onValueChange, style }) => {
  return (
 
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
    >
    
      <View style={[styles.checkbox, value && styles.checked]}>
        
        {value && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>

     
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Alinha a caixa e o texto lado a lado
    alignItems: 'center', // Centraliza verticalmente
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#238bccff', // Cor da borda
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // Espaço entre a caixa e o texto
  },
  checked: {
    backgroundColor: '#238bccff', // Cor de fundo quando a caixa está marcada
  },
  label: {
    color: '#aaa',
    fontSize: 14,
  },
});

export default Checkbox;
