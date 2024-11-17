document.addEventListener('DOMContentLoaded', function () {
  // ...existing code...

  // Set the premade Google Docs link in the link placeholder
  document.getElementById('note-link').value = document.getElementById('premade-google-docs-link').value;

  // Function to generate a random Google Docs link
  function generateRandomGoogleDocsLink() {
    const randomId = Math.random().toString(36).substring(2, 15);
    return `https://docs.google.com/document/d/${randomId}/edit`;
  }

  // Function to add a new note box
  function addNewNoteBox(name, link, privacy, ownerName) {
    const notesContainer = document.getElementById('notes-container').querySelector('.row');
    const newNoteBox = document.createElement('a');
    newNoteBox.href = link;
    newNoteBox.className = "d-flex justify-content-center align-items-center position-relative col withpad";
    newNoteBox.style = "height: 245px; width: 250px; background-color: #FFFFF0; border-radius: 15px; text-decoration: none;";
    newNoteBox.innerHTML = `
      <div class="text-center" style="margin-top: 20px;">
        <div style="height: 135px; width: 210px; background-color: #D9D9D9; display: flex; align-items: center; justify-content: center;">
          <p style="color: white; font-family: DM Mono; font-size: 24px; margin: 0;">Preview</p>
        </div>
        <span style="display: block; font-size: 24px; font-family: DM Mono; color: black; margin-top: 10px;">${name}</span>
        <p style="font-size: 16px; font-family: DM Mono; color: rgba(0, 0, 0, 0.5); margin: 0;">${ownerName}</p>
        <p style="text-align: right; font-size: 14px; font-family: DM Mono; color: rgba(0, 0, 0, 0.5); margin-top: 10px;">${privacy}</p>
      </div>
    `;
    notesContainer.appendChild(newNoteBox);
  }

  // Event listener for the add button
  document.getElementById('add-note-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const name = document.getElementById('note-name').value;
    const link = document.getElementById('note-link').value;
    const privacy = document.getElementById('privacy_value').value;
    const owner_id = document.getElementById('owner_id').value;
    const csrf_token = document.getElementById('csrf_token').value;
    const ownerName = document.getElementById('owner_name').value;

    fetch('/add-notes-and-edit/add_note', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token
      },
      body: JSON.stringify({ name, link, privacy, owner_id })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json().catch(() => {
        throw new Error('Invalid JSON response');
      });
    })
    .then(data => {
      if (data.status === 'success') {
        addNewNoteBox(name, link, privacy, ownerName);
      } else {
        console.error('Error adding note:', data.message);
      }
    })
    .catch(error => console.error('Error:', error));
  });

  // Check for local storage access
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch (e) {
    console.error('Local storage access is not allowed:', e);
  }
});
