document.addEventListener('DOMContentLoaded', function(){
    getListingData();
    
    //login-register forms
    const loginBody = document.getElementById('login-body');
    const registerBody = document.getElementById('register-body');
    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');
    registerLink.addEventListener('click', function() {
        toggleForm(loginBody,registerBody)});
    loginLink.addEventListener('click', function() {
        toggleForm(loginBody,registerBody);});
})

async function getListingData(){
    await fetch('http://localhost:3000/data')
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

async function registerUser(){
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    await fetch("http://localhost:3000/users", {
        method: "POST", body: {"username": username, "password": password}
    })
    .catch(error => console.error("Registration was unsuccessful", error))
}

function toggleForm(loginBody, registerBody){
    if(registerBody.style.display === 'none'){
        registerBody.style.display = 'block';
        loginBody.style.display = 'none';
    } else {
        registerBody.style.display = 'none';
        loginBody.style.display = 'block';
    }
}

//TODO: Fix images