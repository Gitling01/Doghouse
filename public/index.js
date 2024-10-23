document.addEventListener('DOMContentLoaded', function(){
    getListingData();

//login-register forms
    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');
    const loginBody = document.getElementById('login-body');
    const registerBody = document.getElementById('register-body');
    if(registerLink){
         registerLink.addEventListener('click', function() {
        toggleForm(loginBody, registerBody)});
    }
    if(loginLink){
        loginLink.addEventListener('click', function() {
        toggleForm(loginBody, registerBody);});
    }

//login-register submit button
    const registerForm = document.getElementById("register-form");
    if(registerForm){
        registerForm.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData);
        console.log(data);
        registerUser(data);
    })
    }
    
//listing-form
    const listingForm = document.getElementById('listing-form');
    if(listingForm){
        listingForm.addEventListener('submit', event => {
        event.preventDefault();
        createListing();
        listingForm.reset();
        });
    }
    
})

//TODO: can modify it to get city and zipcode too  
async function getListingData(){
    await fetch('http://localhost:3000/listings')
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

async function createListing(){
    const streetAddress = document.getElementById("street-address").value;
    const city = document.getElementById("city").value;
    const zipcode = document.getElementById("zipcode").value;
    const price = parseInt(document.getElementById("price").value);
    const numberOfBedrooms = parseInt(document.getElementById("number-of-bedrooms").value);
    const numberOfBathrooms = parseInt(document.getElementById("number-of-bathrooms").value);
    const photoUrl = document.getElementById("photo-url").value;
    const size = parseInt(document.getElementById("size").value);
    console.log("In createListing: " + streetAddress + " " + city + " " + zipcode + " " + price + " " +
         numberOfBedrooms + " " + numberOfBathrooms + " " + size + " " + photoUrl);
    await fetch("http://localhost:3000/listings", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"street_address": streetAddress, "city": city, 
            "zipcode": zipcode, "price": price, "bedroom_quantity": numberOfBedrooms,
            "bathroom_quantity": numberOfBathrooms, "photo_url": photoUrl, "size": size
        })
    })
    .then(response => {
        if(!response.ok){
            throw new Error("Bad response " + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log("Successfully posted", data);
    })
    .catch(error => console.error("Error creating listing in createListing function", error))
}

//TODO: Check ret
async function registerUser(data){
    const { email, username, password } = data;
    await fetch("http://localhost:3000/users", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"email": email, "username": username, "password": password})
    })
    .then(response => {
        if(!response.ok){
            throw new Error("Bad response " + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log("Successfully posted", data);
    })
    .catch(error => console.error("From registerUser(): Registration was unsuccessful", error))
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