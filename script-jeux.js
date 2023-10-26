document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const submitAnswerButton = document.getElementById('submitAnswer');
    const answerInput = document.getElementById('answerInput');
    const feedback = document.getElementById('feedback');
    const championImage = document.getElementById('championImage');
    const easyButton = document.getElementById('easyButton');
    const hardButton = document.getElementById('hardButton');
    const selectedDifficulty = document.getElementById('selectedDifficulty');
    const rulesContainer = document.getElementById('rulesContainer');
    const gameContainer = document.getElementById('gameContainer');

    let champions = [];
    let currentChampion = null;
    let difficulty = 'facile';
    let attempts = 0;
    let timer = null;
    let timeRemaining = 60;

    startButton.addEventListener('click', startGame);
    submitAnswerButton.addEventListener('click', submitAnswer);

    easyButton.addEventListener('click', () => {
        difficulty = 'facile';
        selectedDifficulty.textContent = 'Le mode de jeu est sur Facile';
    });

    hardButton.addEventListener('click', () => {
        difficulty = 'difficile';
        selectedDifficulty.textContent = 'Le mode de jeu est sur Difficile';
    });

    function fetchChampions() {
        fetch('https://ddragon.leagueoflegends.com/cdn/13.21.1/data/en_US/champion.json')
            .then(response => response.json())
            .then(data => {
                champions = Object.values(data.data).map(champion => ({
                    name: champion.id,
                    image: `https://ddragon.leagueoflegends.com/cdn/13.21.1/img/champion/${champion.image.full}`
                }));
                nextChampion();
            })
            .catch(error => console.error('Error fetching champions:', error));
    }

    function startGame() {
        timeRemaining = 60;
        attempts = difficulty === 'facile' ? 3 : 1;
        fetchChampions();
        startTimer();
        rulesContainer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
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

    function endGame() {
        clearInterval(timer);
        feedback.textContent = 'Le temps est écoulé ! Votre score final est : ' + attempts;
        rulesContainer.classList.remove('hidden');
        gameContainer.classList.add('hidden');
    }

    function submitAnswer() {
        const userAnswer = answerInput.value.trim().toLowerCase();
        const correctAnswer = currentChampion.name.toLowerCase();

        if (userAnswer === correctAnswer) {
            feedback.textContent = 'Correct ! Bien joué.';
            attempts += 1;
            nextChampion();
        } else {
            if (difficulty === 'facile') {
                attempts -= 1;
                if (attempts <= 0) {
                    feedback.textContent = 'Incorrect. Vous avez épuisé vos tentatives !';
                    nextChampion();
                } else {
                    feedback.textContent = `Incorrect. Il vous reste ${attempts} tentatives.`;
                }
            } else {
                feedback.textContent = 'Incorrect. Vous avez épuisé votre tentative !';
                nextChampion();
            }
        }
    }

    function nextChampion() {
        if (champions.length === 0) {
            feedback.textContent = 'Chargement des champions... Veuillez patienter.';
            return;
        }

        const randomIndex = Math.floor(Math.random() * champions.length);
        currentChampion = champions[randomIndex];
        championImage.src = currentChampion.image;
        answerInput.value = '';
    }
});