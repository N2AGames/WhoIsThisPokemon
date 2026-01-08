function loadPokemonData(pokemonName) {
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;
    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        }
    );
}

function loadRandomPokemon() {
    const randomId = Math.floor(Math.random() * 1025) + 1; // Assuming there are 1025 Pokémon
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${randomId}`;
    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        }
    );
}

function displayPokemonPicture(pokemonData) {
    const imgElement = document.getElementById('pokemon-image');
    imgElement.src = pokemonData.sprites.front_default;
    imgElement.alt = pokemonData.name;
}

document.addEventListener('DOMContentLoaded', () => {
    const maxTryes = 5;
    
    let currentPokemonData = null;
    let gessTrys = 0;

    // Load and display a random Pokémon on page load
    loadRandomPokemon()
        .then(pokemonData => {
            currentPokemonData = pokemonData;
            displayPokemonPicture(pokemonData);
        })
        .catch(error => {
            console.error('Error fetching Pokémon data:', error);
            alert('Could not find that Pokémon. Please try again!');
        }
    );
    
    // Handle form submission
    const form = document.getElementById('pokemon-form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const guessInput = document.getElementById('pokemon-guess');
        const guessedName = guessInput.value.trim();
        const trysElement = document.getElementById('pokemon-trys');
        if (guessedName) {
            if(guessedName.toLowerCase() === currentPokemonData.name.toLowerCase()) {
                alert('Correct! You guessed the Pokémon!');
                // Reinitialize the game with a new Pokémon
                initGame();
            } else {
                alert('Wrong!');
                gessTrys++;
                trysElement.textContent = `Tries: ${gessTrys}`;
                if (gessTrys >= maxTryes) {
                    alert(`Game Over! The correct answer was ${currentPokemonData.name}.`);
                    // Reinitialize the game with a new Pokémon
                    initGame();
                }
            }
        } else {
            alert('Please enter a Pokémon name.');
        }
    });
});

function initGame() {
    const trysElement = document.getElementById('pokemon-trys');
    gessTrys = 0;
    trysElement.textContent = `Tries: ${gessTrys}`;

    const guessInput = document.getElementById('pokemon-guess');
    guessInput.value = '';
    // Load and display a new random Pokémon after each guess
    loadRandomPokemon()
        .then(pokemonData => {
            currentPokemonData = pokemonData;
            displayPokemonPicture(pokemonData);
        })
        .catch(error => {
            console.error('Error fetching Pokémon data:', error);
            alert('Could not find that Pokémon. Please try again!');
        }
    );
}