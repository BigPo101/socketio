function loadHost() {
    const code = localStorage.getItem("code");
  
    document.getElementById("code").innerHTML = code;
    checkHome();
  
    const playerNameElement = document.createElement("p");
    playerNameElement.id = "playerName";
    
    const playersDiv = document.querySelector(".players");
    playersDiv.appendChild(playerNameElement);
  
    setInterval(updatePlayerNameElement, 500);
  
    // Remove the player's name when the player leaves the room
    window.addEventListener("beforeunload", () => {
        localStorage.removeItem(`${code}-name`);
    });
  }
  
  function removePlayerFromRoom() {
    const roomCode = localStorage.getItem("code");
    const playerName = localStorage.getItem(`${roomCode}-name`);
    
    localStorage.removeItem(`${roomCode}-name`); // Remove the player's name from localStorage
  
    // Send a request to the server to remove the player from the room
    fetch(`/removePlayer/${roomCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ playerName })
    })
    .then(response => {
      // Handle response as needed
    })
    .catch(error => {
      console.error('Error removing player from room:', error);
    });
  }
  
  function loadHome() {
    removePlayerFromRoom(); // Call the function to remove player from the room
    localStorage.removeItem("code");
  }
  
  function setName(event) {
    event.preventDefault();
    const playerName = document.getElementById("name").value;
    localStorage.setItem("name", playerName);
    const roomCode = localStorage.getItem("code"); // Get the room code from localStorage
  
    // Set the player's name in localStorage with the room code as part of the key
    localStorage.setItem(`${roomCode}-name`, playerName);
  
    // Send the player's name to the host of the room
    sendPlayerNameToHost(playerName, roomCode);
  
    document.getElementsByClassName("index")[0].style.animation = "0.5s fadeOut forwards";
  }
  
  function checkHome() {
    const referrer = document.referrer;
    
    if (referrer.endsWith("/")) {
      // user came from '/'
      if (window.location.pathname == "/room") {
        document.getElementById("name").value = localStorage.getItem("name");
      } else {
        return
      }
      
      // Perform whatever action you want here for users coming from '/door'
    } else {
      // user did not come from '/' 
      window.location.href = "/";
    }
  }
  
  function updatePlayerNameElement() {
    const roomCode = localStorage.getItem("code");
    const playerId = localStorage.getItem("playerId");
  
    fetch(`/getPlayers/${roomCode}`)
      .then(response => response.json())
      .then(data => {
        const playerNameElement = document.getElementById("playerName");
        playerNameElement.textContent = `Name: ${localStorage.getItem("name")} | ID: ${playerId}`;
  
        const playersListElement = document.getElementById("playersList");
        playersListElement.innerHTML = "";
  
        data.players.forEach(player => {
          const playerElement = document.createElement("p");
          playerElement.textContent = `Name: ${player.name} | ID: ${player.id}`;
          playersListElement.appendChild(playerElement);
        });
      })
      .catch(error => {
        console.error('Error updating player names:', error);
      });
  }
  
  function sendPlayerNameToHost(playerName, roomCode) {
    fetch(`/sendPlayerName/${roomCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ playerName })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem("playerId", data.playerId);
        }
      })
      .catch(error => {
        console.error('Error sending player name to host:', error);
      });
  }
  
  async function hostRoom() {
    try {
      const response = await fetch('/createRoom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const { roomCode } = await response.json();
      localStorage.setItem("code", `${roomCode}`);
      window.location.href = "/host";
    } catch (error) {
      console.error('Error creating room:', error);
    }
  }
  
  async function joinRoom(event) {
    event.preventDefault();
    const code = document.getElementById('code').value;
    try {
      const response = await fetch(`/joinRoom/${code}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        window.location.href = "/room";
      } else {
        alert('Failed to join room. Please check the room code and try again.');
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  }