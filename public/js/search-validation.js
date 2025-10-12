function validateSearch() {
    const search = document.getElementById('search').value.trim()
    if (search === '') {
        alert('Please enter a search term.')
        return false
    }
    return true
}