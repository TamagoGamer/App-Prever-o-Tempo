import { useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, TextInput, Button, useColorScheme } from 'react-native';
import { Text, View } from '@/components/Themed';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabOneScreen() {
  const [city, setCity] = useState('Lisbon');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [weather, setWeather] = useState<{ temp: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme(); // Detecta tema do sistema

  const fetchCoordinates = async (cityName: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`);
      if (response.data.results) {
        const { latitude, longitude } = response.data.results[0];
        setCoords({ lat: latitude, lon: longitude });
      } else {
        console.warn('Cidade não encontrada');
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    if (!coords) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`
      );
      setWeather({ temp: response.data.current_weather.temperature });
    } catch (error) {
      console.error('Erro ao buscar clima:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCityFromStorage = async () => {
      const storedCity = await AsyncStorage.getItem('defaultCity');
      if (storedCity) {
        setCity(storedCity);
      }
    };
    loadCityFromStorage();
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [coords]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One - Clima Atual</Text>
      <TextInput
        style={[styles.input, colorScheme === 'dark' && styles.inputDark]}
        placeholder="Digite a cidade"
        placeholderTextColor={colorScheme === 'dark' ? '#ccc' : '#555'}
        value={city}
        onChangeText={setCity}
      />
      <Button title="Buscar Clima" onPress={() => fetchCoordinates(city)} />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        weather && <Text style={styles.temp}>{weather.temp}°C</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 20,
    width: '80%',
    backgroundColor: '#fff',
    color: '#000',
  },
  inputDark: {
    backgroundColor: '#333',
    color: '#fff',
  },
  temp: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
