import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View } from '@/components/Themed';
import { Switch, TextInput, Button } from 'react-native-paper';

export default function ModalScreen() {
  const [isFahrenheit, setIsFahrenheit] = useState(false);
  const [defaultCity, setDefaultCity] = useState('');
  const [loading, setLoading] = useState(false);

  // Carregar configurações salvas do AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedCity = await AsyncStorage.getItem('defaultCity');
        const storedUnit = await AsyncStorage.getItem('isFahrenheit');
        if (storedCity) setDefaultCity(storedCity);
        if (storedUnit !== null) setIsFahrenheit(storedUnit === 'true');
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };
    loadSettings();
  }, []);

  // Função para salvar configurações no AsyncStorage
  const saveSettings = async () => {
    if (!defaultCity.trim()) {
      alert('Por favor, insira uma cidade válida.');
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.setItem('defaultCity', defaultCity);
      await AsyncStorage.setItem('isFahrenheit', isFahrenheit.toString());
      alert('Configurações salvas!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      {/* Input para cidade */}
      <Text style={styles.label}>Cidade Padrão:</Text>
      <TextInput
        style={styles.input}
        mode="outlined"
        placeholder="Digite uma cidade"
        value={defaultCity}
        onChangeText={setDefaultCity}
      />

      {/* Switch para Fahrenheit */}
      <View style={styles.switchContainer}>
        <Text>Usar Fahrenheit?</Text>
        <Switch value={isFahrenheit} onValueChange={setIsFahrenheit} />
      </View>

      {/* Botão para salvar configurações */}
      <Button mode="contained" onPress={saveSettings} style={styles.button} disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar Configurações'}
      </Button>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
  },
  label: {
    fontSize: 16,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    width: '100%',
    paddingVertical: 12,
  },
});
