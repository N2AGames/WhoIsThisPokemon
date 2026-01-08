let pokemonList = [];
let currentPokemonData = null;
let guessTries = 0;
const maxTryes = 5;

document.addEventListener('DOMContentLoaded', () => {
    // Load Pokémon list for autocomplete
    loadPokemonNameList().then(list => {
        pokemonList = list;
        console.log('Pokémon list loaded:', pokemonList.length, 'Pokémon');
    });

    // Setup autocomplete
    const guessInput = document.getElementById('pokemon-guess');
    guessInput.addEventListener('input', handleAutocomplete);

    // Initialize the game
    initGame();
    
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
                guessTries++;
                trysElement.textContent = `Tries: ${guessTries}`;
                if (guessTries >= maxTryes) {
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

function handleAutocomplete(event) {
    const input = event.target.value.toLowerCase();
    const datalist = document.getElementById('pokemon-suggestions');
    
    // Clear previous suggestions
    datalist.innerHTML = '';
    
    // Only show suggestions if 3 or more characters are typed
    if (input.length >= 3) {
        const filtered = pokemonList.filter(name => 
            name.toLowerCase().startsWith(input)
        ).slice(0, 10); // Limit to 10 suggestions
        
        filtered.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            datalist.appendChild(option);
        });
    }
}

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