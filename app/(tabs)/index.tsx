import { useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, TextInput, Button, View as RNView, LayoutAnimation, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabOneScreen() {
  const [city, setCity] = useState('Lisbon');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [weather, setWeather] = useState<{ temp: number; icon: string; hour: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

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

      const code = response.data.current_weather.weathercode;
      const icon = code === 0 ? '☀️' : code < 50 ? '⛅' : '🌧️';
      const hour = new Date().toLocaleTimeString();

      setWeather({ temp: response.data.current_weather.temperature, icon, hour });
    } catch (error) {
      console.error('Erro ao buscar clima:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFavorite = async () => {
    if (!city) return;
    try {
      const newFavorites = [...new Set([...favorites, city])];
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Erro ao salvar favorito:', error);
    }
  };

  const removeFavorite = async (target: string) => {
    const updated = favorites.filter(fav => fav !== target);
    await AsyncStorage.setItem('favorites', JSON.stringify(updated));
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFavorites(updated);
  };

  const loadFavorites = async () => {
    const data = await AsyncStorage.getItem('favorites');
    if (data) setFavorites(JSON.parse(data));
  };

  useEffect(() => {
    const init = async () => {
      const storedCity = await AsyncStorage.getItem('defaultCity');
      if (storedCity) setCity(storedCity);
      loadFavorites();
    };
    init();
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [coords]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clima Atual</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite a cidade"
        value={city}
        onChangeText={setCity}
      />

      <RNView style={styles.buttonGroup}>
        <Button title="Buscar Clima" onPress={() => fetchCoordinates(city)} />
        <View style={{ width: 12 }} />
        <Button title="⭐ Salvar Favorito" onPress={saveFavorite} />
      </RNView>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        weather && (
          <Text style={styles.temp}>
            {weather.icon} {weather.temp}°C - {weather.hour}
          </Text>
        )
      )}

      <Text style={styles.subtitle}>Favoritos</Text>
      {favorites.map((fav, index) => (
        <RNView key={index} style={styles.favoriteItem}>
          <TouchableOpacity onPress={() => { setCity(fav); fetchCoordinates(fav); }}>
            <Text style={styles.favoriteText}>{fav}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeFavorite(fav)}>
            <Text style={styles.removeButton}>❌</Text>
          </TouchableOpacity>
        </RNView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 15,
    width: '80%',
  },
  temp: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 8,
    fontWeight: '600',
  },
  favoriteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    paddingVertical: 5,
  },
  favoriteText: {
    fontSize: 16,
  },
  removeButton: {
    fontSize: 18,
    marginLeft: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'center',
  },
});
