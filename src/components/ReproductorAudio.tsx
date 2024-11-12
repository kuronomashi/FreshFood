import React, { useEffect, useRef, useState } from "react";

const AudioControl: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playAudio = () => {
    if (audioRef.current) {
        audioRef.current.volume = 0.3;
      audioRef.current.play().catch((error) => {
        console.log("Error al reproducir el audio:", error);
      });
      setIsPlaying(true);
    }
  };
  useEffect(() => {
    const handleUserInteraction = () => {
      playAudio();
      window.removeEventListener("click", handleUserInteraction);
    };
    window.addEventListener("click", handleUserInteraction);
    return () => {
      window.removeEventListener("click", handleUserInteraction);
    };
  }, []);

  return (
    <div>
      <audio
        ref={audioRef}
        src="Resourses/NieR_ Automata  A Beautiful Song  Opera Boss Lyrics.mp3"
        loop
      />
    </div>
  );
};

export default AudioControl;
