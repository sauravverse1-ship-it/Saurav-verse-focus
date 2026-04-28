import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import gsap from 'gsap';

// 1. Lag smoothing
gsap.ticker.lagSmoothing(500, 33);

// 3. Tab visibility — pause ticker
document.addEventListener('visibilitychange', () => {
  document.hidden ? gsap.ticker.sleep() : gsap.ticker.wake();
});

// 6. Resize debounce
let resizeTimer: any;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
}, { passive: true });

// 7. prefers-reduced-motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.globalTimeline.timeScale(0);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

