import { useRef, useState, useEffect, useContext } from 'react';
import Slider from 'react-slick';
import styles from './Carrusel.module.css';
import { AuthContext } from './../../context/AuthContext';

const Carrusel = ({ game, image, color, registerGameNow, idGame }) => {
  const sliderRef = useRef(null);
  const [selectedCard, setSelectedCard] = useState(0);
  const [randomNumbers, setRandomNumbers] = useState([]);

  const { userId, setIsModalOpen, isLoggedIn, token } = useContext(AuthContext);

  const [count, setCount] = useState(0);

  const registerCardGame = async (id_card) => {


    try {
        const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}game-card`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                id_game: idGame, 
                id_card: id_card
            }),
        });

        if (!response.ok) {
            throw new Error('Error al registrar el juego de cartas');
        }

        const data = await response.json();
        console.log('Registro exitoso:', data);
    } catch (error) {
        console.error('Error en registerCardGame:');
    }
};

  

  // Configuración del carrusel
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    swipe: false,
    draggable: false,
    beforeChange: (oldIndex, newIndex) => setSelectedCard(newIndex),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // Generar números aleatorios únicos
  const generateUniqueRandomNumbers = () => {
    const numbers = Array.from({ length: game.length }, (_, i) => i);
    let currentIndex = numbers.length, randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [numbers[currentIndex], numbers[randomIndex]] = [
        numbers[randomIndex], numbers[currentIndex],
      ];
    }

    return numbers;
  };

  // useEffect para inicializar los números aleatorios
  useEffect(() => {
    setRandomNumbers(generateUniqueRandomNumbers());
    goToRandomCard();
    console.log("id game ", idGame);
  }, [game]);

  // Función para seleccionar la siguiente card aleatoria
  const goToRandomCard = () => {
    if (count < 2 || isLoggedIn) {
      if (randomNumbers.length > 0) {
        const nextNumber = randomNumbers[0];
        goToCard(nextNumber);
        console.log("ID de la carta seleccionada:", game[nextNumber].id); // Mostrar el ID de la carta seleccionada
        setRandomNumbers(randomNumbers.slice(1));
        //registerCardGame(game[nextNumber].id);
        if (isLoggedIn) {
          if (idGame===0){
            registerGameNow();
          }
          registerCardGame(game[nextNumber].id)
        }
      }
    }else{
      setIsModalOpen(true);
    }

    
    

    setCount(count + 1);
  };

  // Función para mover el carrusel a una card específica
  const goToCard = (index) => {
    if (sliderRef.current && index >= 0 && index < game.length) {
      sliderRef.current.slickGoTo(index);
      setSelectedCard(index);
    }
  };

  return (
    <div className={styles.container}>
      <Slider ref={sliderRef} {...settings}>
        {game.map((item, index) => (
          <div id={item.id} key={item.id} style={{ padding: 10 }}>
            <div
              className={styles.carta}
              style={{
                filter: selectedCard === index ? 'blur(0px)' : 'blur(3px)',
                borderRadius: 20,
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              <img src={`http://127.0.0.1:8000/storage/${image}`} alt="Logo Card" className={styles.image} />
              <div>
                <h5 className={styles.line1}>{item.titulo}</h5>
                <p className={styles.line2}>{item.descripcion}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {/* Botón para mover el carrusel a una card aleatoria */}
      <button onClick={goToRandomCard} className={styles.btn} style={{ color }}>
        Barajar de nuevo
      </button>
    </div>
  );
};

export default Carrusel;
