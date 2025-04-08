import { useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, TextInput, Button, FlatList, useColorScheme } from 'react-native';
import { Text, View } from '@/components/Themed';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabTwoScreen() {
  const [city, setCity] = useState('Lisbon');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [forecast, setForecast] = useState<{ date: string; tempMax: number; tempMin: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();

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

  const fetchForecast = async () => {
    if (!coords) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
      );

      const forecastData = response.data.daily.time.map((date: string, index: number) => ({
        date,
        tempMax: response.data.daily.temperature_2m_max[index],
        tempMin: response.data.daily.temperature_2m_min[index],
      }));

      setForecast(forecastData.slice(0, 5));
    } catch (error) {
      console.error('Erro ao buscar previsão do tempo:', error);
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
    fetchForecast();
  }, [coords]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Previsão do Tempo</Text>
      <TextInput
        style={[styles.input, colorScheme === 'dark' && styles.inputDark]}
        placeholder="Digite a cidade"
        placeholderTextColor={colorScheme === 'dark' ? '#ccc' : '#555'}
        value={city}
        onChangeText={setCity}
      />
      <Button title="Buscar Previsão" onPress={() => fetchCoordinates(city)} />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={forecast}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <View style={styles.forecastItem}>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.temp}>🌡 Máx: {item.tempMax}°C | Mín: {item.tempMin}°C</Text>
            </View>
          )}
        />
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    width: '80%',
    backgroundColor: '#fff',
    color: '#000',
  },
  inputDark: {
    backgroundColor: '#333',
    color: '#fff',
  },
  forecastItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  temp: {
    fontSize: 16,
  },
});
