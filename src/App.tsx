import React, { useState, useEffect } from 'react';
import { Lock, Unlock, AlertCircle, Sun, Moon } from 'lucide-react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function App() {
  const [status, setStatus] = useState('Waiting for RFID...');
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    socket.on('rfidStatus', (message) => {
      setStatus(message);
      if (message === 'Tarjeta válida. Ingrese el PIN en el teclado:') {
        setIsLocked(false);
      } else if (message === 'PIN incorrecto.' || message === 'Tarjeta no válida.') {
        setIsLocked(true);
        setPinInput('');
      }
    });

    socket.on('doorStatus', (isOpen) => {
      setIsLocked(!isOpen);
      if (isOpen) {
        setTimeout(() => {
          setIsLocked(true);
          setStatus('Waiting for RFID...');
          setPinInput('');
        }, 3000);
      }
    });

    return () => {
      socket.off('rfidStatus');
      socket.off('doorStatus');
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    socket.emit('pinInput', pinInput);
    setPinInput('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple login logic (replace with actual authentication)
    if (username === 'admin' && password === 'password') {
      setIsLoggedIn(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-800' : 'bg-gray-100'} flex items-center justify-center`}>
        <div className={`${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} p-8 rounded-lg shadow-md w-96`}>
          <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className={`w-full p-2 mb-2 border rounded ${darkMode ? 'bg-gray-600 text-white' : ''}`}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={`w-full p-2 mb-4 border rounded ${darkMode ? 'bg-gray-600 text-white' : ''}`}
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Login
            </button>
          </form>
        </div>
        <button
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-600"
        >
          {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-800' : 'bg-gray-100'} flex items-center justify-center`}>
      <div className={`${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} p-8 rounded-lg shadow-md w-96`}>
        <h1 className="text-2xl font-bold mb-4 text-center">RFID Access Control</h1>
        <div className="flex justify-center mb-4">
          {isLocked ? (
            <Lock className="w-16 h-16 text-red-500" />
          ) : (
            <Unlock className="w-16 h-16 text-green-500" />
          )}
        </div>
        <p className="text-center mb-4">{status}</p>
        {!isLocked && (
          <form onSubmit={handlePinSubmit} className="mb-4">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter PIN"
              className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-600 text-white' : ''}`}
              maxLength={4}
            />
            <button
              type="submit"
              className="w-full mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Submit PIN
            </button>
          </form>
        )}
        <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          <AlertCircle className="w-4 h-4 mr-1" />
          <span>Scan your RFID card to begin</span>
        </div>
      </div>
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-600"
      >
        {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>
    </div>
  );
}

export default App;