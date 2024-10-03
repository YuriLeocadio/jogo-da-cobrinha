import { useEffect, useState } from 'react';
// import styles from "./game.module.css";
import './game.css'
import { FaAppleAlt } from "react-icons/fa";
import { GiSnakeBite } from 'react-icons/gi';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
    { x: 8, y: 8 },
    { x: 8, y: 9 }
]

const generateFood = () => {
    let newFood
    do {
        newFood = {
            x: Math.floor(Math.random() * ((GRID_SIZE -2) + 1)),
            y: Math.floor(Math.random() * ((GRID_SIZE -2) + 1))
        }
    } while (INITIAL_SNAKE.some((segment) => segment.x === newFood.x && segment.y === newFood.y))
    return newFood;
}
const INITIAL_DIRECTION = { x: 0, y: -1 }

export function Game() {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState(generateFood());
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);

    useEffect(() => {
        const handleKeyPress = (e) => {
            switch (e.key) {
                case "ArrowUp":
                    setDirection({ x: 0, y: -1 })
                    break;

                case "ArrowDown":
                    setDirection({ x: 0, y: 1 })
                    break;

                case "ArrowLeft":
                    setDirection({ x: -1, y: 0 })
                    break;

                case "ArrowRight":
                    setDirection({ x: 1, y: 0 })
                    break;

                default:
                    break;
            }
        };

        addEventListener("keydown", handleKeyPress);
        return () => {
            removeEventListener("keydown", handleKeyPress);
        }
    }, [])

    useEffect(() => {
        if (isGameOver) return;

        const interval = setInterval(() => {
            moveSnake()
        }, 100)

        return () => clearInterval(interval)
    }, [snake, direction, isGameOver]);

    const moveSnake = () => {
        const newSnake = [...snake]
        const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y }

        if (checkCollision(head)) {
            return setIsGameOver(true)
        }

        newSnake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            setScore(score + 1)
            setFood(generateFood())
        } else {
            newSnake.pop()
        }
        setSnake(newSnake)
    }

    const checkCollision = (head) => {
        if (head.x < 0 || head.y < 0 || head.x > GRID_SIZE - 1 || head.y > GRID_SIZE -1) {
            return true
        }
        for (let segment of snake) {
            if (head.x === segment.x && head.y === segment.y) {
                return true;
            }
        }
        return false
    }

    return (
        <>
            
            <h1>Jogo da Cobrinha</h1>
            <h2>Pontuação: {score}</h2>
            {isGameOver && <h2>Game Over</h2>}
            <div className='game'>
                {[...Array(GRID_SIZE)].map((_, row) => (
                    <div key={row} className='row'>
                        {[...Array(GRID_SIZE)].map((_, col) => {
                            let cellClass = "";
                            let isFood = false;
                            let isHead = false;

                            if(snake[0].x === col && snake[0].y === row){
                                isHead = true;
                            }

                            if (snake.some((segment) => segment.x === col && segment.y === row)) {
                                cellClass = "snake";
                            }

                            if (food.x === col && food.y === row) {
                                cellClass = "food";
                                isFood = true
                            }
                            
                            return (
                                <div key={col} className={`cell ${isHead ? 'head' : cellClass}`}>
                                    {isFood ? <FaAppleAlt color='#ff0000' size={26}/> : null}
                                    {isHead ? <GiSnakeBite color='#008631' size={30}/> : null}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        </>
    )
}
