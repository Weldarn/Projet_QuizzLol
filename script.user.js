// Fonction pour gérer l'inscription
function handleRegistration(event) {
    event.preventDefault();

    var pseudo = document.getElementById("pseudo").value;
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirm-password").value;

    if (!pseudo || !password || !confirmPassword) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    if (password.length < 8) {
        document.getElementById("password-error").textContent =
            "Le mot de passe doit contenir au minimum 8 caractères.";
        return;
    } else {
        document.getElementById("password-error").textContent = "";
    }

    if (password !== confirmPassword) {
        alert("Les mots de passe ne correspondent pas.");
        return;
    }

    var data = {
        username: pseudo,
        password: password,
    };

    fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    "La réponse du réseau était pas correcte " + response.statusText
                );
            }
            return response.json();
        })
        .then((responseData) => {
            showOverlay("Inscription réussie. Vous allez être redirigé...");
            setTimeout(function () {
                window.location.href = "connexion.html";
            }, 3000);
        })
        .catch((error) => {
            console.error("Erreur:", error);
            alert("Erreur lors de l'inscription: " + error.message);
        });
}

// Fonction pour gérer la connexion
function handleLogin(event) {
    event.preventDefault();

    var username = document.getElementById("login-username").value;
    var password = document.getElementById("login-password").value;

    if (!username || !password) {
        alert("Veuillez remplir tous les champs de connexion.");
        return;
    }

    var data = {
        username: username,
        password: password,
    };

    fetch("http://127.0.0.1:8000/api/login_check", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            if (!response.ok) {
                return response.text().then((text) => {
                    throw new Error(text || "Erreur de connexion");
                });
            }
            return response.json();
        })
        .then((data) => {
            localStorage.setItem("token", data.token); // Stocker le jeton JWT
            return fetchUserInfo(data.token);
        })
        .then((userInfo) => {
            localStorage.setItem("username", userInfo.username); // Stocker le pseudo de l'utilisateur
            showOverlay("Connexion réussie. Vous allez être redirigé...");
            setTimeout(function () {
                window.location.href = "/indext.html"; // Redirection vers index.html
            }, 3000);
        })
        .catch((error) => {
            console.error("Erreur:", error);
            let errorMessage = "Une erreur s'est produite lors de la tentative de connexion.";
            if (error.message.includes("Undefined variable $roles")) {
                errorMessage = "Une erreur de configuration du serveur a été détectée. Veuillez contacter l'administrateur.";
            }
            alert(errorMessage);
        });
}

// Fonction pour afficher l'overlay
function showOverlay(message) {
    var overlay = document.getElementById("overlay");
    var overlayMessage = document.getElementById("overlay-message");
    overlayMessage.textContent = message;
    overlay.style.display = "flex";
}

// Fonction pour fermer l'overlay
function closeOverlay() {
    var overlay = document.getElementById("overlay");
    overlay.style.display = "none";
}

// Fonction pour récupérer les informations de l'utilisateur
function fetchUserInfo(token) {
    return fetch("http://127.0.0.1:8000/api/user_info", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    }).then((response) => response.json());
}
// Ajout des gestionnaires d'événements après le chargement du DOM
document.addEventListener("DOMContentLoaded", function () {
    var registrationForm = document.getElementById("registration-form");
    if (registrationForm) {
        registrationForm.addEventListener("submit", handleRegistration);
    }

    var loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    var retourButton = document.getElementById("retour-button");
    if (retourButton) {
        retourButton.addEventListener("click", function () {
            window.location.href = "connexion.html";
        });
    }
    var userProfilBtn = document.getElementById("userprofil-btn");
    var userProfilModal = document.getElementById("userprofil-modal");
    var pseudoSpan = document.getElementById("pseudo-span");

    userProfilBtn.addEventListener("click", function () {
        var username = localStorage.getItem("username");
        if (username) {
            pseudoSpan.textContent = username;
        } else {
            pseudoSpan.textContent = "Invité"; // ou toute autre valeur par défaut
        }
        userProfilModal.style.display = "block";
    });

    // Gestion du clic en dehors du modal pour le fermer
    window.addEventListener("click", function (event) {
        if (event.target == userProfilModal) {
            userProfilModal.style.display = "none";
        }
    });
});
