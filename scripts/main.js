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
                // Reveal the Pokémon
                const pokemonImage = document.getElementById('pokemon-image');
                pokemonImage.classList.remove('silhouette');
                
                setTimeout(() => {
                    showNotification(`¡Correcto! 🎉 Era ${currentPokemonData.name}`, 'success', 2500);
                    // Reinitialize the game with a new Pokémon after showing notification
                    setTimeout(() => initGame(), 2500);
                }, 600);
            } else {
                guessTries++;
                trysElement.textContent = `Tries: ${guessTries}`;
                if (guessTries >= maxTryes) {
                    // Reveal the Pokémon when game over
                    const pokemonImage = document.getElementById('pokemon-image');
                    pokemonImage.classList.remove('silhouette');
                    
                    setTimeout(() => {
                        showNotification(`Game Over 😢 El Pokémon era: ${currentPokemonData.name}`, 'error', 3000);
                        // Reinitialize the game with a new Pokémon after showing notification
                        setTimeout(() => initGame(), 3000);
                    }, 600);
                } else {
                    showNotification(`¡Incorrecto! Te quedan ${maxTryes - guessTries} intentos.`, 'warning', 2000);
                }
            }
        } else {
            showNotification('Por favor ingresa un nombre de Pokémon.', 'info', 2000);
        }
    });
});

function handleAutocomplete(event) {
    const input = event.target.value.toLowerCase();
    const dropdown = document.getElementById('suggestions-dropdown');
    
    // Clear previous suggestions
    dropdown.innerHTML = '';
    
    // Only show suggestions if 3 or more characters are typed
    if (input.length >= 3 && pokemonList.length > 0) {
        const filtered = pokemonList.filter(name => 
            name.toLowerCase().startsWith(input)
        ).slice(0, 8); // Limit to 8 suggestions
        
        if (filtered.length > 0) {
            dropdown.style.display = 'block';
            filtered.forEach(name => {
                const suggestion = document.createElement('div');
                suggestion.className = 'suggestion-item';
                suggestion.textContent = name;
                suggestion.addEventListener('click', () => {
                    document.getElementById('pokemon-guess').value = name;
                    dropdown.style.display = 'none';
                });
                dropdown.appendChild(suggestion);
            });
        } else {
            dropdown.style.display = 'none';
        }
    } else {
        dropdown.style.display = 'none';
    }
}

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('suggestions-dropdown');
    const input = document.getElementById('pokemon-guess');
    if (dropdown && e.target !== input && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

// Notification system
function showNotification(message, type = 'info', duration = 3000) {
    return new Promise((resolve) => {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Set icon based on type
        let icon = '';
        if (type === 'success') {
            icon = '✓';
        } else if (type === 'error') {
            icon = '✗';
        } else if (type === 'warning') {
            icon = '!';
        } else {
            icon = 'i';
        }
        
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-message">${message}</div>
        `;
        
        container.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto remove after duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
                resolve();
            }, 300);
        }, duration);
    });
}

function initGame() {
    const trysElement = document.getElementById('pokemon-trys');
    guessTries = 0;
    trysElement.textContent = `Tries: ${guessTries}`;

    const guessInput = document.getElementById('pokemon-guess');
    guessInput.value = '';

    // Load and display a new random Pokémon after each guess
    loadRandomPokemon()
        .then(pokemonData => {
            currentPokemonData = pokemonData;
            displayPokemonPicture(pokemonData);
            
            // Apply silhouette effect
            const pokemonImage = document.getElementById('pokemon-image');
            pokemonImage.classList.add('silhouette');
        })
        .catch(error => {
            console.error('Error fetching Pokémon data:', error);
            showNotification('No se pudo cargar el Pokémon. Por favor intenta de nuevo.', 'error', 3000);
        }
    );
}