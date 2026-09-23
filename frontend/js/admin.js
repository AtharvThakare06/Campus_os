// Function to switch between Admin sections
function showAdminSection(sectionId) {
    document.getElementById('addUser').style.display = 'none';
    document.getElementById('addNotice').style.display = 'none';
    document.getElementById(sectionId).style.display = 'block';
}

// 1. Handle Add User Form
document.getElementById('addUserForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    let name = document.getElementById('newName').value;
    let role = document.getElementById('newRole').value;
    let userId = document.getElementById('newUserId').value;
    let password = document.getElementById('newPassword').value;
    let msgBox = document.getElementById('addMessage');
    
    msgBox.innerText = "Processing...";
    msgBox.style.color = "blue";

    try {
        let response = await fetch('http://localhost:3000/api/adduser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, password, role, name })
        });
        let data = await response.json();
        msgBox.innerText = data.message;
        msgBox.style.color = data.success ? "green" : "red";
        if(data.success) document.getElementById('addUserForm').reset();
    } catch (error) {
        msgBox.innerText = "Server error!";
        msgBox.style.color = "red";
    }
});

// 2. Handle Post Notice Form (New Feature)
document.getElementById('addNoticeForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    let title = document.getElementById('noticeTitle').value;
    let content = document.getElementById('noticeContent').value;
    let msgBox = document.getElementById('noticeMessage');
    
    msgBox.innerText = "Publishing...";
    msgBox.style.color = "blue";

    try {
        let response = await fetch('http://localhost:3000/api/addnotice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });
        let data = await response.json();
        msgBox.innerText = data.message;
        msgBox.style.color = data.success ? "green" : "red";
        if(data.success) document.getElementById('addNoticeForm').reset();
    } catch (error) {
        msgBox.innerText = "Server error!";
        msgBox.style.color = "red";
    }
});