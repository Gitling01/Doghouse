document.addEventListener('DOMContentLoaded', function(){
    getListingData();

    if(window.location.pathname.endsWith('listing-details.html')){
        setUpListingDetailsPage();
    }

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

    const loginForm = document.getElementById("login-form");
    if(loginForm){
        loginForm.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData);
        console.log(data);
        loginUser(data);
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

const addListingButton = document.getElementById("add-listing-button");
if(addListingButton){
    addListingButton.addEventListener('click', async () => {
        console.log("The add listing button was clicked");
        const loggedIn = await checkAuthentication();
        if(loggedIn){ 
            window.location.href = "listing-form.html";
        } else {
            window.location.href = "login.html";
        }
    });
} else {
    console.log("addListingButton element not found");
}

const deleteListingButton = document.getElementById('delete-listing-button');
if(deleteListingButton){
    deleteListingButton.addEventListener('click', async () => {
        deleteListing();
        document.getElementById('listing-details-page-address-title').textContent = "This listing has been deleted";
        document.getElementById('listing-details-page-price').textContent = "";
        document.getElementById('listing-details-page-bedrooms').textContent = "";
        document.getElementById('listing-details-page-bathrooms').textContent = "";
        document.getElementById('listing-details-page-size').textContent = "";
        document.getElementById('listing-details-page-image').src = "/images/no-image-available.jpg";
        document.getElementById('delete-listing-button').style.display = "none";
    });
}
  
}) ////end of main event listener////


async function getListingData(){
    await fetch('http://localhost:3000/listings',{
        method: "GET",
        headers: {"Content-Type": "application/json"},
    })
    .then(response => response.json())
    .then(data => {
        data.forEach((item, index) => { 
            const listingElements = document.getElementsByClassName('listing');
            const streetAddressElements = document.getElementsByClassName('street-address');
            const priceElements = document.getElementsByClassName('price');
            const numBedroomsElements = document.getElementsByClassName('bedroom-quantity');
            const numBathroomsElements = document.getElementsByClassName('bathroom-quantity');
            const sizeElements = document.getElementsByClassName('size');
           // const photoUrlElements = document.getElementsByClassName('property-image');
            if(index < streetAddressElements.length){
               listingElements[index].setAttribute('data-id',item.listing_id);
               listingElements[index].addEventListener('click', () => {
                   localStorage.setItem('selectedListingId',item.listing_id);
                   window.location.href="listing-details.html";
                }); 
                streetAddressElements[index].textContent = item.street_address;
                priceElements[index].textContent = "$" + item.price;
                numBedroomsElements[index].textContent = "Beds: " + item.bedroom_quantity;
                numBathroomsElements[index].textContent = "Baths: " + item.bathroom_quantity;
                sizeElements[index].textContent = "Sq ft: " + item.size;
                //photoUrlElements[index].src = item.photo_url;
               // console.log("item.photo_url");
            }
        }); 
    })   
    .catch(error => console.error(error)); 
}

async function setUpListingDetailsPage(){
    const listingId = localStorage.getItem('selectedListingId');
    if(!listingId){
        console.error("No listing id found in localStorage");
        return;
    }
    try{
        const response = await fetch(`http://localhost:3000/listings?listing_id=${listingId}`);
        if(!response.ok){
            throw new Error(`Error getting response from fetch request: ${response.status}`);
        }
        const listingArray = await response.json();
        const listing = listingArray[0];
        if(!listing){
            console.error("Listing not found");
            return;
        }
        document.getElementById('listing-details-page-address-title').textContent = listing.street_address;
        document.getElementById('listing-details-page-price').textContent = `$${listing.price}`;
        document.getElementById('listing-details-page-bedrooms').textContent = `Beds: ${listing.bedroom_quantity}`;
        document.getElementById('listing-details-page-bathrooms').textContent = `Baths: ${listing.bathroom_quantity}`;
        document.getElementById('listing-details-page-size').textContent = `Sq ft: ${listing.size}`;
        document.getElementById('listing-details-page-image').src = `${listing.photo_url}`
    } catch(error){
        console.error("setUpListingDetailsPage: Error getting the listing details", error);
    }
}

//TODO: logic to check if a user is logged in already
async function checkAuthentication(){
    try{
        const response = await fetch('http://localhost:3000/protected/add-listing', {
            method: "GET",
            headers: {"Content-Type": "application/json"},
            credentials: 'include'
        })
        return response.ok;
    }catch(error){
        console.error("checkAuthentication: error checking authentication", error);
        return false;
    }
    
};

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

//delete listing TODO: (make button event listener next)
async function deleteListing(){
    const listingId = localStorage.getItem('selectedListingId');
    if(!listingId){
        console.error("No listing id found in localStorage");
        return;
    }
    const response = await fetch(`http://localhost:3000/listings?listing_id=${listingId}`, {
            method: "DELETE",
            headers:{ "Content-Type": "application/json"
            }
        })
    .then(response => {
        if(!response.ok){
            throw new Error(`Error getting response from fetch request: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => console.error("deleteListing(): Error fetching route to delete listing", error))
}

//TODO: Check return
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

//login user function
async function loginUser(data){
    const { username, password } = data;
    await fetch('http://localhost:3000/users/login', {
        method: "POST",
        credentials: 'include',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"username": username, "password": password})
    })
    .then(response => {
        if(!response.ok){
            throw new Error("Bad response" + response.statusText);
        }
        window.location.href = '/public/index.html';
        return response.json();
    })
    .then(data => {
        console.log("From loginUser(): successfully logged in", data);
    })
    .catch(error => console.error("From loginUser(): login was unsuccessful", error))
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