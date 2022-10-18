//imports
import '../auth/user.js';
import { getGame, createGuess, onGuess, getGuess, setGameState } from '../fetch-utils.js';
import { renderGuess } from '../render-ultils.js';

//DOM
const errorDisplay = document.getElementById('error-display');
const gameTitle = document.getElementById('game-title');
const gameImage = document.getElementById('game-image');
const addGuessForm = document.getElementById('add-guess-form');
const guessList = document.getElementById('guess-list');
const timer = document.getElementById('timer');
const startGameButton = document.getElementById('start-game');

//state
let time = 60000; // Start at 60s
let error = null;
let game = null;
let gameState = 'pre'; //pre, inProgress, results

//events
startGameButton.addEventListener('click', async () => {
    game.game_state = 'inProgress';
    console.log('game:', game);
    setGameState(game);
});

window.addEventListener('load', async () => {
    setInterval(timerTick, 1000);
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');

    if (!id) {
        location.replace('/');
        return;
    }

    const response = await getGame(id);
    error = response.error;
    game = response.data;

    if (error) {
        displayError();
    }

    if (!game) {
        location.replace('/');
    } else {
        displayGame();
        displayGuesses();
    }

    onGuess(game.id, async (payload) => {
        const guessId = payload.new.id;
        const guessResponse = await getGuess(guessId);
        error = guessResponse.error;
        if (error) {
            displayError();
        } else {
            const guess = guessResponse.data;
            game.guesses.unshift(guess);
            displayGuesses();
        }
    });
});

addGuessForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(addGuessForm);
    const guessInsert = {
        guess: formData.get('guess'),
        game_id: game.id,
    };
    const response = await createGuess(guessInsert);
    error = response.error;

    if (error) {
        displayError();
    } else {
        addGuessForm.reset();
    }
});

function timerTick() {
    if (time > 0) time -= 1000;
    displayTime();
    // console.log('time: ', time);
}

//display functions
function displayGame() {
    gameTitle.textContent = game.title;
    gameImage.src = game.image_url;
}

function displayTime() {
    timer.textContent = `${time / 1000} seconds`;
}

function displayGuesses() {
    guessList.innerHTML = '';

    for (const guess of game.guesses) {
        const guessEl = renderGuess(guess);
        guessList.append(guessEl);
    }
}

function displayError() {
    if (error) {
        errorDisplay.textContent = error.message;
    } else {
        errorDisplay.textContent = '';
    }
}
