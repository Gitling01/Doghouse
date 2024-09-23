document.addEventListener('DOMContentLoaded', function(){
    getListingData();
})

function getListingData(){
    fetch('http://localhost:3000/data')
    .then(response => response.text())
    .then(data => console.log(data))    
    .catch(error => console.error(error)); 
}

TODO: Update getListingData to show actual listing data