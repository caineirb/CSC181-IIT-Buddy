// nagbutang lng kog mga predefine values
const suggestions = [
    "CSC101", "CSC102", "CSC181 Software Engineering",
    "Caine Ivan", "Louis Antondy", "Ealr Andrew",
    "help", "us", "Lord"
];

const searchInput = document.getElementById('search-line-modal');
const container = document.querySelector('.suggestions-container');

const displaySuggestions = (items) => {
    container.innerHTML = '';
    items.forEach(suggestion => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = suggestion;
        container.appendChild(div);
    });
};

displaySuggestions(suggestions);

searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = suggestions.filter(item => item.toLowerCase().includes(query));

    displaySuggestions(filtered);

    if (filtered.length === 0 && query !== '') {
        const noMatchFound = document.createElement('div');
        noMatchFound.className = 'suggestion-item';
        noMatchFound.textContent = 'No suggestions found.';
        // pwede sab kani:
        // noMatchFound.textContent = `No "${query}" found.`;
        container.appendChild(noMatchFound);
    }
});

function clearSearchInput() {
    document.getElementById('search-line-modal').value = '';
    displaySuggestions(suggestions);
}