document.addEventListener('DOMContentLoaded', function(){
    getListingData();
})

function getListingData(){
    fetch('http://localhost:3000/listing_data')
    .then(response => response.json())
    .then(data => console.log(data))    
    .catch(error => console.error(error)); 
}

//TODO: 