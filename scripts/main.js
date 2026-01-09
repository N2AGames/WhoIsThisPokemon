let pokemonList = [];
let currentPokemonData = null;
let guessTries = 0;
const maxTryes = 5;

// Stats system
let gameStats = {
    wins: 0,
    losses: 0,
    history: []
};

// Load stats from localStorage
function loadStats() {
    const saved = localStorage.getItem('pokemonGameStats');
    if (saved) {
        gameStats = JSON.parse(saved);
    }
    updateStatsDisplay();
}

// Save stats to localStorage
function saveStats() {
    localStorage.setItem('pokemonGameStats', JSON.stringify(gameStats));
    updateStatsDisplay();
}

// Add game result to history
function addGameResult(won, pokemonName, tries) {
    const result = {
        won: won,
        pokemon: pokemonName,
        tries: tries,
        timestamp: new Date().toISOString()
    };
    
    gameStats.history.unshift(result); // Add to beginning
    if (gameStats.history.length > 50) {
        gameStats.history = gameStats.history.slice(0, 50); // Keep last 50 games
    }
    
    if (won) {
        gameStats.wins++;
    } else {
        gameStats.losses++;
    }
    
    saveStats();
}

// Update stats display
function updateStatsDisplay() {
    const winsElement = document.getElementById('total-wins');
    const lossesElement = document.getElementById('total-losses');
    const winRateElement = document.getElementById('win-rate');
    
    if (winsElement) winsElement.textContent = gameStats.wins;
    if (lossesElement) lossesElement.textContent = gameStats.losses;
    
    const totalGames = gameStats.wins + gameStats.losses;
    const winRate = totalGames > 0 ? Math.round((gameStats.wins / totalGames) * 100) : 0;
    if (winRateElement) winRateElement.textContent = winRate + '%';
    
    updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
    const historyContainer = document.getElementById('game-history');
    if (!historyContainer) return;
    
    if (gameStats.history.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">No games played yet.</p>';
        return;
    }
    
    historyContainer.innerHTML = gameStats.history.map(game => {
        const date = new Date(game.timestamp);
        const timeStr = date.toLocaleString('es-ES', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const resultClass = game.won ? 'success' : 'error';
        const resultIcon = game.won ? '✓' : '✗';
        const resultText = game.won ? 'Win' : 'Loss';
        
        return `
            <div class="history-item ${resultClass}">
                <span class="history-icon">${resultIcon}</span>
                <span class="history-pokemon">${game.pokemon}</span>
                <span class="history-result">${resultText} (${game.tries} tries)</span>
                <span class="history-time">${timeStr}</span>
            </div>
        `;
    }).join('');
}

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
            showNotification('Could not load the Pokémon. Please try again.', 'error', 3000);
        }
    );
}

function playPokemonCry(pokemonSound, pokemonData) {
    if (pokemonData?.cries?.legacy || pokemonData?.cries?.latest) {
        pokemonSound.src = pokemonData?.cries?.legacy || pokemonData?.cries?.latest;
        pokemonSound.play().catch(err => console.error('Error playing sound:', err));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Load stats
    loadStats();
    
    // Load Pokémon list for autocomplete
    loadPokemonNameList().then(list => {
        pokemonList = list;
        console.log('Pokémon list loaded:', pokemonList.length, 'Pokémon');
    });

    // Setup autocomplete
    const guessInput = document.getElementById('pokemon-guess');
    guessInput.addEventListener('input', handleAutocomplete);

    // Stats modal handlers
    const statsButton = document.getElementById('stats-button');
    const statsModal = document.getElementById('stats-modal');
    const closeBtn = statsModal.querySelector('.stats-close-btn');
    const clearStatsBtn = document.getElementById('clear-stats-btn');

    // Sound components
    const pokemonSound = document.getElementById('pokemon-sound');
    pokemonSound.volume = 0.5; // Set default volume
    
    statsButton.addEventListener('click', () => {
        statsModal.style.display = 'flex';
        updateStatsDisplay();
    });
    
    closeBtn.addEventListener('click', () => {
        statsModal.style.display = 'none';
    });
    
    statsModal.addEventListener('click', (e) => {
        if (e.target === statsModal) {
            statsModal.style.display = 'none';
        }
    });
    
    clearStatsBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all statistics?')) {
            gameStats = { wins: 0, losses: 0, history: [] };
            saveStats();
            showNotification('Statistics cleared', 'info', 2000);
        }
    });

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
                playPokemonCry(pokemonSound, currentPokemonData);
                // Register win
                addGameResult(true, currentPokemonData.name, guessTries + 1);
                
                setTimeout(() => {
                    showNotification(`Correct! 🎉 It was ${currentPokemonData.name}`, 'success', 2500);
                    // Play Pokémon cry sound
                    playPokemonCry(pokemonSound, currentPokemonData);
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
                    
                    // Register loss
                    addGameResult(false, currentPokemonData.name, guessTries);
                    
                    setTimeout(() => {
                        showNotification(`Game Over 😢 The Pokémon was: ${currentPokemonData.name}`, 'error', 3000);
                        // Play Pokémon cry sound
                        playPokemonCry(pokemonSound, currentPokemonData);

                        // Reinitialize the game with a new Pokémon after showing notification
                        setTimeout(() => initGame(), 3000);
                    }, 600);
                } else {
                    showNotification(`Incorrect! You have ${maxTryes - guessTries} tries left.`, 'warning', 2000);
                    guessInput.value = '';
                }
            }
        } else {
            showNotification('Please enter a Pokémon name.', 'info', 2000);
        }
    });

    // Handle reveal button
    const revealButton = document.getElementById('reveal-button');
    revealButton.addEventListener('click', () => {
        // Reveal the Pokémon when game over
        const pokemonImage = document.getElementById('pokemon-image');
        pokemonImage.classList.remove('silhouette');
        
        // Register loss
        addGameResult(false, currentPokemonData.name, guessTries);
        
        setTimeout(() => {
            showNotification(`Game Over 😢 The Pokémon was: ${currentPokemonData.name}`, 'error', 3000);
            // Play Pokémon cry sound
            playPokemonCry(pokemonSound, currentPokemonData);

            // Reinitialize the game with a new Pokémon after showing notification
            setTimeout(() => initGame(), 3000);
        }, 600);
    });
});