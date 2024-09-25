document.addEventListener('DOMContentLoaded', function(){
    getListingData();
})

function getListingData(){
    fetch('http://localhost:3000/data')
    .then(response => response.json())
    .then(data => {
        data.forEach(listing => {
            console.log(`Address: ${listing.street_address}, Price: ${listing.price}`);
        }); 
    })   
    .catch(error => console.error(error)); 
}

//TODO: Update getListingData to get the rest of the properties 
//and to change document elements to those values