document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const submitAnswerButton = document.getElementById('submitAnswerButton');
    const answerInput = document.getElementById('answerInput');
    const feedback = document.getElementById('feedback');
    const itemImage = document.getElementById('itemImage');
    const gameContainer = document.getElementById('gameContainer');
    const overlay = document.getElementById('overlay');
    const overlayText = document.getElementById('overlayText');
    const closeOverlay = document.getElementById('closeOverlay');

    let itemsData = {};
    let currentItem = null;
    let attempts = 3;
    let isGameOver = false;

    startButton.addEventListener('click', startGame);
    submitAnswerButton.addEventListener('click', submitAnswer);
    answerInput.addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
            submitAnswer();
        }
    });
    closeOverlay.addEventListener('click', () => {
        overlay.style.display = 'none';
        if (isGameOver) {
            resetGame();
        }
    });

    startButton.disabled = true;
    fetchItems();

    function fetchItems() {
        fetch('https://ddragon.leagueoflegends.com/cdn/13.21.1/data/fr_FR/item.json')
            .then(response => response.json())
            .then(data => {
                itemsData = data.data;
                startButton.disabled = false;
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des items:', error);
                startButton.disabled = true;
            });
    }

    function getRandomItem() {
        const itemKeys = Object.keys(itemsData);
        const randomIndex = Math.floor(Math.random() * itemKeys.length);
        const randomItemKey = itemKeys[randomIndex];
        return itemsData[randomItemKey];
    }

    function displayItem(item) {
        if (item.image && item.image.full) {
            itemImage.src = `https://ddragon.leagueoflegends.com/cdn/13.21.1/img/item/${item.image.full}`;
        } else {
            console.error('Impossible d\'afficher l\'item, données manquantes:', item);
        }
    }

    function startGame() {
        console.log('Démarrage du jeu');
        resetGame();
        currentItem = getRandomItem();
        if (!currentItem) {
            console.error('Erreur : Impossible de récupérer un item aléatoire.');
            return;
        }
        displayItem(currentItem);
        gameContainer.classList.remove('hidden');
        document.getElementById('rulesContainer').classList.add('hidden');
        console.log('Jeu démarré');
    }

    function submitAnswer() {
        const userAnswer = answerInput.value.trim().toLowerCase();
        const correctAnswer = currentItem.name.toLowerCase();

        if (userAnswer === correctAnswer) {
            feedback.textContent = 'Correct !';
            setTimeout(() => {
                nextItem();
            }, 1000);
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

    function nextItem() {
        currentItem = getRandomItem();
        displayItem(currentItem);
        attempts = 3;
        feedback.textContent = '';
    }

    function endGame(reason) {
        console.log('Fin du jeu', reason);
        if (isGameOver) return;
        isGameOver = true;
        let message = `Le jeu est terminé ! La réponse correcte était ${currentItem.name}.`;
        if (reason === 'attempts') {
            message = `Vous avez épuisé vos tentatives ! La réponse correcte était ${currentItem.name}.`;
        }
        showResultOverlay(message);
        setTimeout(() => {
            if (isGameOver) {
                gameContainer.classList.add('hidden');
            }
        }, 5000);
    }

    function showResultOverlay(message) {
        overlayText.textContent = message;
        overlay.style.display = 'flex';
    }

    function resetGame() {
        attempts = 3;
        isGameOver = false;
        feedback.textContent = '';
        overlay.style.display = 'none';
        gameContainer.classList.add('hidden');
        document.getElementById('rulesContainer').classList.remove('hidden');
    }
});