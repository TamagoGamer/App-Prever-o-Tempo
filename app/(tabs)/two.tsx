import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View as RNView, LayoutAnimation, Alert, useColorScheme } from 'react-native';
import { Text, View } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

export default function TabTwoScreen() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Detectar o modo de tema (claro ou escuro)
  const colorScheme = useColorScheme();

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
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Previsão de 7 Dias</Text>

      <Picker
        selectedValue={selectedCity}
        style={[styles.picker, colorScheme === 'dark' && styles.pickerDark]} // Estilo condicional para modo escuro
        onValueChange={(itemValue) => setSelectedCity(itemValue)}>
        {favorites.map((city, index) => (
          <Picker.Item key={index} label={city} value={city} />
        ))}
      </Picker>

      {loading ? (
        <Text>Carregando previsão...</Text>
      ) : (
        forecast.map((day, index) => (
          <View key={index} style={[styles.card, colorScheme === 'dark' && styles.cardDark]}>
            <Text style={styles.date}>{day.date}</Text>
            <Text style={styles.weather}>{day.icon} {day.minTemp}°C - {day.maxTemp}°C</Text>
            {day.warning ? <Text style={styles.warning}>{day.warning}</Text> : null}
          </View>
        ))
      )}
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
    borderColor: '#ccc', // Adicionando borda para o Picker
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff', // Cor de fundo para o modo claro
    color: '#000', // Cor da fonte no modo claro
    marginBottom: 20,
  },
  pickerDark: {
    backgroundColor: '#333', // Cor de fundo para o modo escuro
    color: '#fff', // Cor da fonte no modo escuro
  },
  card: {
    backgroundColor: '#eee', // Cor padrão para o modo claro
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    width: '100%',
  },
  cardDark: {
    backgroundColor: '#444', // Cor mais escura para o modo escuro
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
