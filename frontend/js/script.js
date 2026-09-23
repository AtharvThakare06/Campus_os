// Update form title and switch active tab
function changeRole(roleName, element) {
    document.getElementById('form-title').innerText = roleName + " Login";
    
    // Clear any previous error messages when switching tabs
    document.getElementById('loginMessage').innerText = "";

    let buttons = document.getElementsByClassName('tab-btn');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }

    element.classList.add('active');
}

// Function to toggle password visibility
function togglePassword() {
    let passInput = document.getElementById("password");
    if (passInput.type === "password") {
        passInput.type = "text";
    } else {
        passInput.type = "password";
    }
}

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent default page reload

    let userId = document.getElementById('userId').value;
    let password = document.getElementById('password').value;
    let titleText = document.getElementById('form-title').innerText;
    let role = titleText.split(" ")[0]; 
    
    let msgBox = document.getElementById('loginMessage');
    msgBox.innerText = "Checking credentials...";
    msgBox.style.color = "blue";

    try {
        let response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: userId, password: password, role: role })
        });

        let data = await response.json();

        if (data.success) {
            // Show Success Message
            msgBox.innerText = data.message;
            msgBox.style.color = "green";
            
            // Redirect based on User Role
            setTimeout(() => {
                if (data.role === "Student") {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'admin_dashboard.html';
                }
            }, 1000);
        } else {
            // Show Error Message
            msgBox.innerText = data.message;
            msgBox.style.color = "red";
        }
    } catch (error) {
        console.error("API Error:", error);
        msgBox.innerText = "Server error! Ensure backend is running.";
        msgBox.style.color = "red";
    }
});