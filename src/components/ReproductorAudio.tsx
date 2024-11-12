import React, { useEffect, useRef, useState } from "react";

const AudioControl: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  const songs = [
    "/resources/NieR_-Automata-A-Beautiful-Song-Opera-Boss-Lyrics.ogg",
    "/resources/It_s-Going-Down-Now.ogg", 
    "/resources/Aishite-Aishite-Aishite.ogg",
    "/resources/椎名もた_siinamota_-Young-Girl-A-少女A.ogg",
    "/resources/BLOODY-STREAM.ogg",
    "/resources/Bunny-Girl.ogg",
  ];

  useEffect(() => {
    if (audioRef.current) {
      console.log("Paso a la sigueinte cancion");
      audioRef.current.load();
      playAudio(); 
    }
  }, [currentSongIndex]);

  const playAudio = () => {
    if (audioRef.current) {
        audioRef.current.volume = 0.1;
      audioRef.current.play().catch((error) => {
        console.log("Error al reproducir el audio:", error);
      });
      setIsPlaying(true);
    }
  };
  const handleSongEnd = () => {
    // Avanzar al siguiente índice
    const nextSongIndex = (currentSongIndex + 1) % songs.length; // Se reinicia al principio al llegar al final
    setCurrentSongIndex(nextSongIndex);
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
        src={songs[currentSongIndex]}  
        loop={false}  
        onEnded={handleSongEnd}  
      />
    </div>
  );
};

export default AudioControl;
