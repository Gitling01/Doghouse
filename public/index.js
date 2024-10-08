document.addEventListener('DOMContentLoaded', function(){
    getListingData();
})

function getListingData(){
    fetch('http://localhost:3000/data')
    .then(response => response.json())
    .then(data => {
        data.forEach((item, index) => { 
            const streetAddressElements = document.getElementsByClassName('street-address');
            const priceElements = document.getElementsByClassName('price');
            const numBedroomsElements = document.getElementsByClassName('bedroom-quantity');
            const numBathroomsElements = document.getElementsByClassName('bathroom-quantity');
            const sizeElements = document.getElementsByClassName('size');
           // const photoUrlElements = document.getElementsByClassName('property-image');
            if(index < streetAddressElements.length){
                streetAddressElements[index].textContent = item.street_address;
                priceElements[index].textContent = "Price: " + "$" + item.price;
                numBedroomsElements[index].textContent = "Bedrooms: " + item.bedroom_quantity;
                numBathroomsElements[index].textContent = "Bathrooms: " + item.bathroom_quantity;
                sizeElements[index].textContent = "Sq ft: " + item.size;
                //photoUrlElements[index].src = item.photo_url;
               // console.log("item.photo_url");
            }
        }); 
    })   
    .catch(error => console.error(error)); 
}

//TODO: Fix images
//TODO: Edit Fetch call to match best practices