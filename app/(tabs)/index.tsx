import { useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, TextInput, Button, View as RNView, LayoutAnimation, TouchableOpacity, Appearance } from 'react-native';
import { Text, View } from '@/components/Themed';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabOneScreen() {
  const [city, setCity] = useState('Lisbon');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [weather, setWeather] = useState<{ temp: number; icon: string; hour: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const colorScheme = Appearance.getColorScheme();

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

  const containerStyle = colorScheme === 'dark' ? styles.containerDark : styles.containerLight;
  const inputStyle = colorScheme === 'dark' ? styles.inputDark : styles.inputLight;
  const buttonGroupStyle = colorScheme === 'dark' ? styles.buttonGroupDark : styles.buttonGroupLight;
  const textStyle = colorScheme === 'dark' ? styles.textDark : styles.textLight;
  const tempStyle = colorScheme === 'dark' ? styles.tempDark : styles.tempLight;
  const subtitleStyle = colorScheme === 'dark' ? styles.subtitleDark : styles.subtitleLight;
  const favoriteTextStyle = colorScheme === 'dark' ? styles.favoriteTextDark : styles.favoriteTextLight;
  const removeButtonStyle = colorScheme === 'dark' ? styles.removeButtonDark : styles.removeButtonLight;

  return (
    <View style={containerStyle}>
      <Text style={styles.title}>Clima Atual</Text>

      <TextInput
        style={inputStyle}
        placeholder="Digite a cidade"
        value={city}
        onChangeText={setCity}
        placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#888'}
      />

      <RNView style={buttonGroupStyle}>
        <Button title="Buscar Clima" onPress={() => fetchCoordinates(city)} />
        <View style={{ width: 12 }} />
        <Button title="⭐ Salvar Favorito" onPress={saveFavorite} />
      </RNView>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        weather && (
          <Text style={tempStyle}>
            {weather.icon} {weather.temp}°C - {weather.hour}
          </Text>
        )
      )}

      <Text style={subtitleStyle}>Favoritos</Text>
      {favorites.map((fav, index) => (
        <RNView key={index} style={styles.favoriteItem}>
          <TouchableOpacity onPress={() => { setCity(fav); fetchCoordinates(fav); }}>
            <Text style={favoriteTextStyle}>{fav}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeFavorite(fav)}>
            <Text style={removeButtonStyle}>❌</Text>
          </TouchableOpacity>
        </RNView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  containerLight: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  containerDark: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  inputLight: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 15,
    width: '80%',
    color: '#000',
    backgroundColor: '#fff',
  },
  inputDark: {
    height: 40,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 15,
    width: '80%',
    color: '#fff',
    backgroundColor: '#333',
  },
  buttonGroupLight: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'center',
  },
  buttonGroupDark: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'center',
  },
  textLight: {
    color: '#000',
  },
  textDark: {
    color: '#fff',
  },
  tempLight: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#000',
  },
  tempDark: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#fff',
  },
  subtitleLight: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 8,
    fontWeight: '600',
    color: '#000',
  },
  subtitleDark: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 8,
    fontWeight: '600',
    color: '#fff',
  },
  favoriteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    paddingVertical: 5,
  },
  favoriteTextLight: {
    fontSize: 16,
    color: '#000',
  },
  favoriteTextDark: {
    fontSize: 16,
    color: '#fff',
  },
  removeButtonLight: {
    fontSize: 18,
    marginLeft: 10,
    color: '#ff0000',
  },
  removeButtonDark: {
    fontSize: 18,
    marginLeft: 10,
    color: '#ff6347',
  },
});
