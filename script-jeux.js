document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const submitAnswerButton = document.getElementById('submitAnswerButton');
    const answerInput = document.getElementById('answerInput');
    const feedback = document.getElementById('feedback');
    const championImage = document.getElementById('championImage');
    const easyButton = document.getElementById('easyButton');
    const hardButton = document.getElementById('hardButton');
    const selectedDifficulty = document.getElementById('selectedDifficulty');
    const rulesContainer = document.getElementById('rulesContainer');
    const gameContainer = document.getElementById('gameContainer');
    const overlay = document.getElementById('overlay');
    const overlayText = document.getElementById('overlayText');
    const closeOverlay = document.getElementById('closeOverlay');

    let championsData = {};
    let currentChampion = null;
    let difficulty = 'facile';
    let attempts = 3;
    let timer = null;
    let timeRemaining = 60;
    let score = 0;
    let isGameOver = false;
    let currentImageType = 'champion';

    startButton.addEventListener('click', () => {
        if (isGameOver) {
            resetGame();
        }
        startGame();
    });

    submitAnswerButton.addEventListener('click', submitAnswer);

    easyButton.addEventListener('click', () => {
        difficulty = 'facile';
        selectedDifficulty.textContent = 'Le mode de jeu est sur Facile';
    });

    answerInput.addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
            submitAnswer();
        }
    });

    hardButton.addEventListener('click', () => {
        difficulty = 'difficile';
        selectedDifficulty.textContent = 'Le mode de jeu est sur Difficile';
    });

    startButton.disabled = true;
    fetchChampions();

    closeOverlay.addEventListener('click', () => {
        overlay.style.display = 'none';
        if (isGameOver) {
            resetGame();
        }
    });

    function fetchChampions() {
        fetch('https://ddragon.leagueoflegends.com/cdn/13.21.1/data/fr_FR/champion.json')
            .then(response => response.json())
            .then(data => {
                const championIds = Object.keys(data.data);
                const championDetailsPromises = championIds.map(id =>
                    fetch(`https://ddragon.leagueoflegends.com/cdn/13.21.1/data/fr_FR/champion/${id}.json`)
                        .then(response => response.json())
                        .then(championData => championData.data[id])
                );
                return Promise.all(championDetailsPromises);
            })
            .then(champions => {
                championsData = champions.reduce((acc, champion) => {
                    acc[champion.id] = champion;
                    return acc;
                }, {});
                startButton.disabled = false;
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des champions:', error);
                startButton.disabled = true;
            });
    }

    function getRandomChampion() {
        const championKeys = Object.keys(championsData);
        const randomIndex = Math.floor(Math.random() * championKeys.length);
        const randomChampionKey = championKeys[randomIndex];
        return championsData[randomChampionKey];
    }

    function displayChampion(champion) {
        if (difficulty === 'difficile') {
            currentImageType = Math.random() < 0.5 ? 'champion' : 'spell';
            console.log('Image Type:', currentImageType);
        } else {
            currentImageType = 'champion';
        }

        if (currentImageType === 'spell' && champion.spells && champion.spells.length > 0) {
            const randomSpellIndex = Math.floor(Math.random() * champion.spells.length);
            const spell = champion.spells[randomSpellIndex];
            if (spell && spell.image && spell.image.full) {
                championImage.src = `https://ddragon.leagueoflegends.com/cdn/13.21.1/img/spell/${spell.image.full}`;
                console.log('Spell Image URL:', `https://ddragon.leagueoflegends.com/cdn/13.21.1/img/spell/${spell.image.full}`);
                return;
            } else {
                console.error('Données de la compétence manquantes ou incorrectes:', spell);
            }
        }

        if (champion.image && champion.image.full) {
            championImage.src = `https://ddragon.leagueoflegends.com/cdn/13.21.1/img/champion/${champion.image.full}`;
            console.log('Image du champion:', championImage.src);
        } else {
            console.error('Impossible d\'afficher le champion, données manquantes:', champion);
        }
    }


    function startGame() {
        console.log('Démarrage du jeu');
        resetGame();
        timeRemaining = 60;
        attempts = 3;
        score = 0;
        currentChampion = getRandomChampion();
        if (!currentChampion) {
            console.error('Erreur : Impossible de récupérer un champion aléatoire.');
            return;
        }
        displayChampion(currentChampion);
        startTimer();
        rulesContainer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        console.log('Jeu démarré');
    }

    function endGame(reason) {
        console.log('Fin du jeu', reason);
        if (isGameOver) return;
        isGameOver = true;
        clearInterval(timer);
        let message = `Le temps est écoulé ! Votre score final est de ${score}.`;
        if (reason === 'attempts') {
            message = `Vous avez épuisé vos tentatives ! Votre score final est de ${score}. La réponse correcte était ${currentChampion.name}.`;
        }
        showResultOverlay(message);
        setTimeout(() => {
            if (isGameOver) {
                rulesContainer.classList.remove('hidden');
                gameContainer.classList.add('hidden');
            }
        }, 5000);
    }

    function startTimer() {
        timer = setInterval(() => {
            timeRemaining -= 1;
            document.getElementById('timer').textContent = `Temps restant: ${timeRemaining}s`;
            if (timeRemaining <= 0) {
                endGame();
            }
        }, 1000);
    }

    function submitAnswer() {
        const userAnswer = answerInput.value.trim().toLowerCase();
        const correctAnswer = currentChampion.name.toLowerCase();

        if (userAnswer === correctAnswer) {
            feedback.textContent = '';
            score += 1;
            nextChampion();
        } else {
            attempts -= 1;
            if (attempts <= 0) {
                feedback.textContent = 'Incorrect. Vous avez épuisé vos tentatives !';
                endGame('attempts');
            } else {
                feedback.textContent = `Incorrect. Il vous reste ${attempts} tentatives.`;
            }
        }
        answerInput.value = '';
    }

    function nextChampion() {
        currentChampion = getRandomChampion();
        displayChampion(currentChampion);
        answerInput.value = '';
    }

    function showResultOverlay(message) {
        overlayText.textContent = message;
        overlay.style.display = 'flex';
    }

    function resetGame() {
        clearInterval(timer);
        timeRemaining = 60;
        attempts = 3;
        score = 0;
        isGameOver = false;

        document.getElementById('timer').textContent = `Temps restant: ${timeRemaining}s`;
        feedback.textContent = '';
        overlay.style.display = 'none';

        rulesContainer.classList.remove('hidden');
        gameContainer.classList.add('hidden');
    }
});