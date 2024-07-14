/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useStateContext } from './Context';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import search from './assets/icons/search.svg';
import { BackgroundLayout, WeatherCard, MiniCard } from './Components';

function App() {
  const [input, setInput] = useState('');
  const { weather, thisLocation, values, setPlace } = useStateContext();
  const [position, setPosition] = useState([10.379663, 78.820847]);
  const [searchQuery, setSearchQuery] = useState('');

  const submitCity = () => {
    if (input) {
      setPlace(input);
      setSearchQuery(input);
      setInput('');
    }
  };

  const MapUpdater = ({ position }) => {
    const map = useMap();

    useEffect(() => {
      if (position) {
        // Zoom out first
        map.flyTo(position, 0, { duration: 1.5 });
        const zoomInTimeout = setTimeout(() => {
          map.flyTo(position, 13, { duration: 1.5 });
        }, 2000);

        return () => clearTimeout(zoomInTimeout);
      }
    }, [position, map]);

    return null;
  };

  useEffect(() => {
    if (searchQuery) {
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json`)
        .then(response => response.json())
        .then(data => {
          if (data.length > 0) {
            const newCoords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            setPosition(newCoords);
          }
        });
    }
  }, [searchQuery]);

  return (
    <div className='w-full h-screen text-white px-8'>
      <nav className='w-full p-3 flex justify-between items-center'>
        <h1 className='font-bold tracking-wide text-3xl'>Weather App</h1>
        <div className='bg-white w-60 overflow-hidden shadow-2xl rounded flex items-center p-2 gap-2'>
          <img src={search} alt="search" className='w-6 h-6' />
          <input
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                submitCity();
              }
            }}
            type="text"
            placeholder='Search city'
            className='focus:outline-none w-full text-gray-800 text-lg'
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>
      </nav>
      <BackgroundLayout />
      <main className='flex flex-wrap items-center'>
        <div className='flex flex-wrap items-center w-full items-center justify-evenly gap-8'>
          <WeatherCard
            place={thisLocation}
            windspeed={weather.wspd}
            humidity={weather.humidity}
            temperature={weather.temp}
            heatIndex={weather.heatindex}
            iconString={weather.conditions}
            conditions={weather.conditions}
          />
          <div className='w-full lg:w-[40%]'>
            <MapContainer center={position} zoom={13} className="h-[50vh]">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={position}>
                <Popup>A pretty CSS3 popup.<br />Easily customizable.</Popup>
              </Marker>
              <MapUpdater position={position} />
            </MapContainer>
          </div>
        </div>

        <div className='flex justify-center gap-8 flex-wrap w-full mt-8'>
          {values?.slice(1, 7).map(curr => (
            <MiniCard
              key={curr.datetime}
              time={curr.datetime}
              temp={curr.temp}
              iconString={curr.conditions}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;

