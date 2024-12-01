// slapjack/client/src/hooks/useSoundEffects.js
import { useEffect, useRef } from 'react';

export function useSoundEffects() {
  const sounds = useRef({});

  useEffect(() => {
    sounds.current = {
      cardPlay: new Audio('/sounds/card-play.mp3'),
      slap: new Audio('/sounds/slap.mp3'),
      victory: new Audio('/sounds/victory.mp3')
    };

    return () => {
      Object.values(sounds.current).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

  return {
    playCardSound: () => sounds.current.cardPlay.play(),
    playSlapSound: () => sounds.current.slap.play(),
    playVictorySound: () => sounds.current.victory.play()
  };
}