'use client';

import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Loader2 } from 'lucide-react';

interface WeatherBadgeProps {
  date: string;
}

// Mappa i codici meteo WMO (standard Open-Meteo) in icone e colori
const getWeatherIcon = (code: number | null) => {
  if (code === null) return <Cloud className="h-5 w-5 text-gray-400" />;
  if (code >= 0 && code <= 1) return <Sun className="h-5 w-5 text-yellow-500" />;
  if (code >= 2 && code <= 48) return <Cloud className="h-5 w-5 text-sky-400" />;
  if (code >= 51 && code <= 99) return <CloudRain className="h-5 w-5 text-blue-500" />;
  return <Sun className="h-5 w-5 text-yellow-400" />; // Icona di default
};

export default function WeatherBadge({ date }: WeatherBadgeProps) {
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        // Coordinate di Roma, come da nome del club
        const lat = 41.890251;
        const lon = 12.492373;
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max&timezone=Europe/Rome`;

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        // Trova l'indice che corrisponde alla data dell'evento
        const eventDateIndex = data.daily.time.findIndex((d: string) => d === date);

        if (eventDateIndex !== -1) {
          setWeather({
            temp: Math.round(data.daily.temperature_2m_max[eventDateIndex]),
            code: data.daily.weathercode[eventDateIndex],
          });
        } else {
          setWeather(null); // Data fuori dal range delle previsioni
        }
      } catch (error) {
        console.error("Errore nel caricamento del meteo:", error);
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [date]);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Meteo...</span>
      </div>
    );
  }

  if (!weather) {
    return null; // Non mostrare nulla se il meteo non è disponibile
  }

  return (
    <div className="flex items-center space-x-2 p-1.5 bg-muted/60 rounded-lg">
      {getWeatherIcon(weather.code)}
      <span className="font-bold text-sm">{weather.temp}°C</span>
    </div>
  );
}
