

export interface Event {
  event_id: string;
  title: string;
  details: string;
  date: string;
  time: string;
  category?: string | null;
  datetime: string | null;
  isIndefinite?: boolean;
  user_email: string;
  label_id?: string | null;
}

export interface AirQualityData {
  time: string;
  european_aqi: number;
  pm2_5: number;
  nitrogen_dioxide: number;
  sulphur_dioxide: number;
  ozone: number;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  location?: { 
    name: string;
    country: string;
  };
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    apparent_temperature: string;
    surface_pressure: string;
    precipitation: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    surface_pressure: number;
    precipitation: number;
  };
  hourly_units: {
    time: string;
    temperature_2m: string;
    visibility: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    visibility: number[];
  };
  daily_units: {
    time: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    sunrise: string;
    sunset: string;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
  };
  air_quality: AirQualityData;
}

// These are for the components, which are now different from the main API response
export interface ForecastDay {
  date: string;
  maxtemp: number;
  mintemp: number;
}

export interface HourData {
  time: string;
  temp: number;
}

export interface Project {
  project_id: string;
  user_email: string;
  name: string;
  created_at: string;
}

export type Priority = 'Very Important' | 'Important' | 'Not Important' | 'Casual';

export interface Todo {
  todo_id: string;
  user_email: string;
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: Priority;
  completed: boolean;
  created_at: string;
  completed_at?: string | null;
  label_id?: string | null;
}

export interface Label {
  label_id: string;
  user_email: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Notebook {
  notebook_id: string;
  user_email: string;
  name: string;
  created_at: string;
}

export interface Note {
  note_id: string;
  notebook_id: string;
  user_email: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}
