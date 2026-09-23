// Switch sections
function showSection(sectionId) {
    document.getElementById('academic').style.display = 'none';
    document.getElementById('notice').style.display = 'none';
    document.getElementById('library').style.display = 'none';
    
    document.getElementById(sectionId).style.display = 'block';

    // Fetch notices dynamically when the Notice Board tab is clicked
    if (sectionId === 'notice') {
        fetchNotices();
    }
}

// Fetch notices from Custom API
async function fetchNotices() {
    let container = document.getElementById('noticeContainer');
    container.innerHTML = "Fetching latest notices...";

    try {
        let response = await fetch('http://localhost:3000/api/notices');
        let data = await response.json();

        if (data.success && data.notices.length > 0) {
            container.innerHTML = ""; // Clear loading text
            
            // Loop through all notices and display them
            data.notices.forEach(notice => {
                let noticeCard = `
                    <div style="background: #f9f9f9; padding: 15px; margin-bottom: 15px; border-left: 5px solid #0056b3; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h3 style="color: #0056b3; margin-bottom: 5px;">${notice.title}</h3>
                        <p style="font-size: 14px; color: #555; margin-bottom: 10px;">${notice.content}</p>
                        <small style="color: #999;">Published on: ${notice.date}</small>
                    </div>
                `;
                container.innerHTML += noticeCard;
            });
        } else {
            container.innerHTML = "<p>No notices available at the moment.</p>";
        }
    } catch (error) {
        console.error("Error fetching notices:", error);
        container.innerHTML = "<p style='color:red;'>Failed to load notices. Ensure backend is running.</p>";
    }
}

function logout() {
    window.location.href = 'index.html';
}