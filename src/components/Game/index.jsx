import { useEffect, useState } from 'react';
import './game.css'
import { FaAppleAlt } from "react-icons/fa";
import { GiSnakeBite, GiPoisonBottle } from 'react-icons/gi';

// Define o tamanho da grade do jogo como 20x20 celulas
const GRID_SIZE = 20;

// Define a cobra inicial com dois segmentos
const INITIAL_SNAKE = [
    { x: 8, y: 8 }, // Posição do primeiro segmento (cabeça) da cobra
    { x: 8, y: 9 } // Posição do segundo segmento (corpo) da cobra
]

// Defina a velocidade inicial da cobra (em milissegundos)
const INITIAL_SPEED = 150;

// Função para gerar a comida em uma posição aleatória na grade
const generateFood = () => {
    let newFood
    do {
        newFood = { // Gera coordenadas aleatórias para a nova comida.
            x: Math.floor(Math.random() * ((GRID_SIZE - 2) + 1)), // Calcula uma posição X aleatória dentro da grade
            y: Math.floor(Math.random() * ((GRID_SIZE - 2) + 1)) // Calcula uma posição Y aleatória dentro da grade
        };
    } while (INITIAL_SNAKE.some((segment) => segment.x === newFood.x && segment.y === newFood.y)) // Repete até que a comida não esteja em cima de algum segmento da cobra
    return newFood; // Retorna a nova posição da comida
};

// Função para gerar veneno em uma posição aleatória evitando a cobra e a comida
const generatePoison = (snake, food) => {
    let newPoison
    do {
        newPoison = { // Gera coordenadas aleatórias para o veneno
            x: Math.floor(Math.random() * ((GRID_SIZE - 2) + 1)), // Calcula uma posição X aleatória
            y: Math.floor(Math.random() * ((GRID_SIZE - 2) + 1)) // Calcula uma posição Y aleatória
        };
    } while (
        snake.some((segment) => segment.x === newPoison.x && segment.y === newPoison.y) || // Garante que o veneno não apareça em cima da cobra
        (food.x === newPoison.x && food.y === newPoison.y) // Garante que o veneno não apareça na mesma posição da comida
    );
    return newPoison;
};

// Define a direção inicial da cobra para cima (eixo Y negativo)
const INITIAL_DIRECTION = { x: 0, y: -1 }

export function Game() {
    const [snake, setSnake] = useState(INITIAL_SNAKE); // Estado para armazenar a cobra,começando com o valor INITIAL_SNAKE
    const [food, setFood] = useState(generateFood()); // Estado para armazenar a posição da comida gerada inicialmente pela função generateFood
    const [poison, setPoison] = useState(null); // Estado para armazenar a posição do veneno começando como null
    const [direction, setDirection] = useState(INITIAL_DIRECTION); // Estado para armazenar a direção da cobra começando com a direção inicial
    const [score, setScore] = useState(0); // Estado para armazenar a pontuação iniciando com 0.
    const [foodCount, setFoodCount] = useState(0); // Estado para contar quantas comidas a cobra comeu
    const [isGameOver, setIsGameOver] = useState(false); // Estado para indicar se o jogo terminou iniciando como false
    const [speed, setSpeed] = useState(INITIAL_SPEED); // Estado para controlar a velocidade da cobra

    const restartGame = () => {
        setSnake(INITIAL_SNAKE);
        setFood(generateFood());
        setPoison(null);
        setDirection(INITIAL_DIRECTION);
        setScore(0);
        setFoodCount(0);
        setIsGameOver(false);
        setSpeed(INITIAL_SPEED);
    };

    // Hook para capturar eventos de teclas pressionadas para controlar a direção da cobra
    useEffect(() => {
        // Função que sera chamada quando uma tecla for pressionada
        const handleKeyPress = (e) => {
            switch (e.key) { // Verifica qual tecla foi pressionada
                case "ArrowUp":
                    setDirection({ x: 0, y: -1 }); // Muda a direção para cima
                    break;

                case "ArrowDown":
                    setDirection({ x: 0, y: 1 }); // Muda a direção para baixo
                    break;

                case "ArrowLeft":
                    setDirection({ x: -1, y: 0 }); // Muda a direção para a esquerda
                    break;

                case "ArrowRight":
                    setDirection({ x: 1, y: 0 }); // Muda a direção para a direita
                    break;

                default:
                    break;
            }
        };

        // Adiciona o evento quando uma tecla é pressionada
        addEventListener("keydown", handleKeyPress);
        return () => {
            // Remove o evento quando o componente é desmontado
            removeEventListener("keydown", handleKeyPress);
        }
    }, []) // O array de dependencias vazio significa que o efeito só sera executado uma vez após o componente ser montado

    // Hook que movimenta a cobra periodicamente e executa o jogo
    useEffect(() => {
        if (isGameOver) return; // Se o jogo terminou não faz nada

        const interval = setInterval(() => {
            moveSnake() // A cada 100 milissegundos chama a função moveSnake para mover a cobra
        }, speed) // Usa a velocidade do estado

        return () => clearInterval(interval) // Limpa o intervalo quando o componente é desmontado ou o jogo termina
    }, [snake, direction, isGameOver, speed]); // Executa o efeito sempre que a cobra, direção, velocidade ou estado de fim de jogo mudar

    // Função que move a cobra
    const moveSnake = () => {
        // Faz uma cópia da cobra para atualizar sua posição
        const newSnake = [...snake];

        // Calcula a nova posição da cabeça somando a direção a posição atual
        const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y }

        // Verifica se a nova posição colide com algo
        if (checkCollision(head)) {
            return setIsGameOver(true) // Se houver colisão termina o jogo
        }

        // Adiciona a nova cabeça ao inicio da cobra
        newSnake.unshift(head);

        // Verifica se a cobra comeu a comida
        if (head.x === food.x && head.y === food.y) {
            setScore(score + 1) // Incrementa a pontuação
            setFood(generateFood()) // Gera uma nova comida
            setFoodCount(foodCount + 1) // Aumenta o contador de comidas

            // Aumenta a velocidade da cobra a cada comida
            setSpeed((prevSpeed) => Math.max(10, prevSpeed - 5)); // Reduz o ms de 5 em 5(aumenta velocidade) com limite de 10ms
            console.log(speed)

            // A cada 6 comidas gera um veneno
            if ((foodCount + 1) % 6 === 0) {
                setPoison(generatePoison(newSnake, food)); // Gera uma nova posição de veneno
            }
        } else {
            newSnake.pop(); // Remove o ultimo segmento da cobra (ela só cresce ao comer comida)
        }

        // Verifica se a cobra tocou o veneno
        if (poison && head.x === poison.x && head.y === poison.y) {
            return setIsGameOver(true) // Se tocou o veneno termina o jogo
        }

        setSnake(newSnake); // Atualiza o estado da cobra com a nova posição
    };

    // Função que verifica se a cobra colidiu com as paredes ou com ela mesma
    const checkCollision = (head) => {
        // Verifica se a cabeça está fora dos limites da grade
        if (head.x < 0 || head.y < 0 || head.x > GRID_SIZE - 1 || head.y > GRID_SIZE - 1) {
            return true // Retorna verdadeiro se houver colisão com a parede
        }
        // Verifica se a cabeça colidiu com o corpo da cobra
        for (let segment of snake) {
            if (head.x === segment.x && head.y === segment.y) {
                return true; // Retorna verdadeiro se a cobra colidir com ela mesma
            }
        }
        return false // Retorna falso se não houver colisão
    };

    // Renderização do jogo
    return (
        <>

            <h1>Jogo da Cobrinha</h1>
            <h2>Pontuação: {score}</h2>
            {isGameOver ? <h2>Game Over</h2> : null}

            <div className='game'>
                {[...Array(GRID_SIZE)].map((_, row) => ( // Cria um array do tamanho GRID_SIZE e itera sobre as linhas
                    <div key={row} className='row'> {/* Cada linha do grid */}
                        {[...Array(GRID_SIZE)].map((_, col) => { // Cria um array do tamanho GRID_SIZE e itera sobre as colunas
                            let cellClass = "";
                            let isFood = false;
                            let isHead = false;
                            let isPoisonCell = false;

                            // Verifica se a célula e a cabeça da cobra
                            if (snake[0].x === col && snake[0].y === row) {
                                isHead = true;
                            }

                            // Verifica se a célula e um segmento da cobr
                            if (snake.some((segment) => segment.x === col && segment.y === row)) {
                                cellClass = "snake";
                            }

                            // Verifica se a célula contém comida
                            if (food.x === col && food.y === row) {
                                cellClass = "food";
                                isFood = true
                            }

                            // Verifica se a célula contém veneno
                            if (poison && poison.x === col && poison.y === row) {
                                cellClass = "venom";
                                isPoisonCell = true;
                            }

                            return (
                                <div key={col} className={`cell ${isHead ? 'head' : cellClass}`}>
                                    {isFood ? <FaAppleAlt color='#ff0000' size={26} /> : null}
                                    {isHead ? <GiSnakeBite color='#008631' size={30} /> : null}
                                    {isPoisonCell ? <GiPoisonBottle color='#8B008B' size={30} /> : null}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
            {isGameOver ? (
                <button onClick={restartGame} className='btn'>Reiniciar Jogo</button>
            ) : null}
        </>
    )
}
