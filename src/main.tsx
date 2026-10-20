import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MotionPlaybackProvider } from './ExercisePlayer';
import './styles.css';
import './motion.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MotionPlaybackProvider><App /></MotionPlaybackProvider>
  </React.StrictMode>,
);
