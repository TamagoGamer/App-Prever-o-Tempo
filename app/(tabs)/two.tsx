import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View as RNView, LayoutAnimation, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

export default function TabTwoScreen() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [forecast, setForecast] = useState<any[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      const data = await AsyncStorage.getItem('favorites');
      if (data) {
        const favs = JSON.parse(data);
        setFavorites(favs);
        setSelectedCity(favs[0]);
      }
    };
    loadFavorites();
  }, []);

  useEffect(() => {
    if (selectedCity) fetchForecast(selectedCity);
  }, [selectedCity]);

  const fetchForecast = async (city: string) => {
    try {
      const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
      const { latitude, longitude } = geo.data.results[0];

      const weather = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
      );

      const days = weather.data.daily.time.map((date: string, index: number) => {
        const maxTemp = weather.data.daily.temperature_2m_max[index];
        const minTemp = weather.data.daily.temperature_2m_min[index];
        const code = weather.data.daily.weathercode[index];

        const icon = code === 0 ? '☀️' : code < 50 ? '⛅' : '🌧️';
        const warning =
          code >= 80 ? '⚠️ Tempestade perigosa prevista!' :
          code >= 70 ? '⚠️ Chuvas muito fortes previstas!' :
          code >= 60 ? '⚠️ Possível tempestade!' : '';

        return { date, maxTemp, minTemp, icon, warning };
      });

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setForecast(days);
    } catch (error) {
      console.error('Erro ao buscar previsão:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Previsão de 7 Dias</Text>

      <Picker
        selectedValue={selectedCity}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedCity(itemValue)}>
        {favorites.map((city, index) => (
          <Picker.Item key={index} label={city} value={city} />
        ))}
      </Picker>

      {forecast.map((day, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.date}>{day.date}</Text>
          <Text style={styles.weather}>{day.icon} {day.minTemp}°C - {day.maxTemp}°C</Text>
          {day.warning ? <Text style={styles.warning}>{day.warning}</Text> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: '90%',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    width: '100%',
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  weather: {
    fontSize: 16,
    marginVertical: 4,
  },
  warning: {
    color: 'red',
    fontWeight: 'bold',
  },
});
