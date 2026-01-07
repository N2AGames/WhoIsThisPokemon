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

function displayPokemonPicture(pokemonData) {
    const imgElement = document.getElementById('pokemon-image');
    imgElement.src = pokemonData.sprites.front_default;
    imgElement.alt = pokemonData.name;
}

document.addEventListener('DOMContentLoaded', () => {
    // Handle form submission
    const form = document.getElementById('pokemon-form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const guessInput = document.getElementById('pokemon-guess');
        const guessedName = guessInput.value.trim();
        loadPokemonData(guessedName)
            .then(pokemonData => {
                displayPokemonPicture(pokemonData);
            })
            .catch(error => {
                console.error('Error fetching Pokémon data:', error);
                alert('Could not find that Pokémon. Please try again!');
            }
        );
    });
});