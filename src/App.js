import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [zonePosition, setZonePosition] = useState(50); // 0-100, donde 50 es el centro
  const [showZones, setShowZones] = useState(true);
  const [gameMode, setGameMode] = useState('setup'); // 'setup', 'playing', 'guessing'
  const [stickRotation, setStickRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseX, setLastMouseX] = useState(0);
  const [lastTouchX, setLastTouchX] = useState(0);
  const semicircleRef = useRef(null);
  
  const categories = [
    {
      left: "Cosas de adultos",
      right: "Cosas de niños"
    },
    {
      left: "Cosas de la ciudad",
      right: "Cosas del campo"
    },
    {
      left: "Cosas calientes",
      right: "Cosas frías"
    },
    {
      left: "Cosas dulces",
      right: "Cosas saladas"
    },
    {
      left: "Cosas de día",
      right: "Cosas de noche"
    },
    {
      left: "Cosas de verano",
      right: "Cosas de invierno"
    },
    {
      left: "Cosas de la playa",
      right: "Cosas de la montaña"
    },
    {
      left: "Cosas de la cocina",
      right: "Cosas del jardín"
    },
    {
      left: "Cosas de la música",
      right: "Cosas del deporte"
    },
    {
      left: "Cosas de la tecnología",
      right: "Cosas tradicionales"
    },
    {
      left: "Cosas de la moda",
      right: "Cosas prácticas"
    },
    {
      left: "Cosas de la literatura",
      right: "Cosas del cine"
    },
    {
      left: "Cosas de la ciencia",
      right: "Cosas del arte"
    },
    {
      left: "Cosas de la medicina",
      right: "Cosas de la cocina"
    },
    {
      left: "Cosas de la naturaleza",
      right: "Cosas artificiales"
    }
  ];

  const changeCategory = () => {
    setCurrentCategoryIndex((prev) => (prev + 1) % categories.length);
  };

  const changeZone = () => {
    setZonePosition(Math.floor(Math.random() * 101)); // 0-100
    setGameMode('playing');
    setStickRotation(0); // Resetear palito al centro
  };

  const toggleZones = () => {
    setShowZones(!showZones);
  };

  const startGuessing = () => {
    setGameMode('guessing');
  };

  // Función para convertir rotación a posición en el semicírculo
  const rotationToPosition = (rotation) => {
    // Convertir rotación de -90 a 90 grados a posición 0-100
    const normalizedRotation = (rotation + 90) / 180;
    return Math.max(0, Math.min(100, normalizedRotation * 100));
  };

  const handleMouseDown = (e) => {
    if (gameMode === 'guessing') {
      setIsDragging(true);
      setLastMouseX(e.clientX);
    }
  };

  const handleTouchStart = (e) => {
    if (gameMode === 'guessing') {
      e.preventDefault(); // Prevenir scroll en móviles
      setIsDragging(true);
      setLastTouchX(e.touches[0].clientX);
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging && gameMode === 'guessing') {
      const deltaX = e.clientX - lastMouseX;
      const sensitivity = 0.5;
      
      setStickRotation(prev => {
        const newRotation = prev + deltaX * sensitivity;
        return Math.max(-90, Math.min(90, newRotation));
      });
      
      setLastMouseX(e.clientX);
    }
  }, [isDragging, lastMouseX, gameMode]);

  const handleTouchMove = useCallback((e) => {
    if (isDragging && gameMode === 'guessing') {
      e.preventDefault(); // Prevenir scroll en móviles
      const deltaX = e.touches[0].clientX - lastTouchX;
      const sensitivity = 0.5;
      
      setStickRotation(prev => {
        const newRotation = prev + deltaX * sensitivity;
        return Math.max(-90, Math.min(90, newRotation));
      });
      
      setLastTouchX(e.touches[0].clientX);
    }
  }, [isDragging, lastTouchX, gameMode]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, lastMouseX, lastTouchX, gameMode, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const checkGuess = () => {
    const stickPosition = rotationToPosition(stickRotation);
    const distance = Math.abs(stickPosition - zonePosition);
    let accuracy = 0;
    
    if (distance <= 10) accuracy = 100;
    else if (distance <= 20) accuracy = 80;
    else if (distance <= 30) accuracy = 40;
    
    alert(`¡Acierto: ${accuracy}%! La zona estaba en ${zonePosition}% y tu palito en ${Math.round(stickPosition)}%`);
    setGameMode('setup');
  };

  // Calcular ángulo de rotación para la zona central
  const getCentralZoneRotation = () => {
    return (zonePosition / 100) * 180 - 90; // -90 a 90 grados
  };

  return (
    <div className="App">
      <div className="game-container">
        {/* Categorías en los extremos */}
        <div className="categories">
          <div className="category left">{categories[currentCategoryIndex].left}</div>
          <div className="category right">{categories[currentCategoryIndex].right}</div>
        </div>
        
        {/* Semicírculo con zona de acierto */}
        <div className="semicircle-container">
          <div className="semicircle" ref={semicircleRef}>
            {/* Zonas de acierto como divs únicos */}
            {showZones && (
              <>
                {/* Zona externa (40% acierto) - más delgada */}
                <div
                  className="zone-segment outer-zone"
                  style={{
                    transform: `rotate(${getCentralZoneRotation()}deg)`,
                    transformOrigin: 'center bottom'
                  }}
                />
                
                {/* Zona media (80% acierto) - ancho medio */}
                <div
                  className="zone-segment middle-zone"
                  style={{
                    transform: `rotate(${getCentralZoneRotation()}deg)`,
                    transformOrigin: 'center bottom'
                  }}
                />
                
                {/* Zona central (100% acierto) - más gruesa */}
                <div
                  className="zone-segment central-zone"
                  style={{
                    transform: `rotate(${getCentralZoneRotation()}deg)`,
                    transformOrigin: 'center bottom'
                  }}
                />
              </>
            )}
            
            {/* Palito rojo para adivinar */}
            {gameMode === 'guessing' && (
              <div 
                className="stick"
                style={{ 
                  transform: `rotate(${stickRotation}deg)`,
                  transformOrigin: 'center bottom'
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              />
            )}
          </div>
        </div>
        
        {/* Números de referencia alrededor del semicírculo */}
        <div className="reference-numbers">
          {Array.from({ length: 41 }, (_, i) => {
            // Calcular posición en el semicírculo (0 a 180 grados)
            const angle = (i / 40) * 180; // 0 a 180 grados
            const radius = 34.3; // Radio del semicírculo en vw
            
            // Convertir ángulo a coordenadas cartesianas
            // Ajustar para que 0° esté a la izquierda y 180° a la derecha
            const x = Math.cos((angle - 180) * Math.PI / 180) * radius;
            const y = Math.sin((angle - 180) * Math.PI / 180) * radius;
            
            return (
              <div 
                key={i} 
                className="number"
                style={{
                  left: `calc(50% + ${x}vw)`,
                  top: `calc(65% + ${y}vw)`
                }}
              >
                {i}
              </div>
            );
          })}
        </div>

        {/* Controles del juego */}
        <div className="controls">
          <button className="control-btn" onClick={changeCategory}>
            Cambiar Categoría ({currentCategoryIndex + 1}/{categories.length})
          </button>
          <button className="control-btn" onClick={changeZone}>
            Cambiar Zona
          </button>
          <button className="control-btn" onClick={toggleZones}>
            {showZones ? 'Ocultar' : 'Mostrar'} Zonas
          </button>
          {gameMode === 'playing' && (
            <button className="control-btn start-guessing" onClick={startGuessing}>
              Empezar a Adivinar
            </button>
          )}
        </div>

        {/* Controles del palito */}
        {gameMode === 'guessing' && (
          <div className="stick-controls">
            <button className="stick-btn" onClick={() => setStickRotation(0)}>
              Centrar Palito
            </button>
            <button className="stick-btn confirm" onClick={checkGuess}>
              ¡Adivinar!
            </button>
          </div>
        )}
        
       
      </div>
    </div>
  );
}

export default App;
