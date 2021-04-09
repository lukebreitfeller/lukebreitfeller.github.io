// Object constructor to keep all information associated with product accessible throughout site.

class ProductInfo {
    constructor(name,source,alt,price) {
	this.productName = name;
	this.source = source;
	this.alt = alt;
	this.price = price;
    }
}

// Object constructor to track glaze and amount per roll type

class ProductCount {
    constructor(name,glaze,num) {
 
	this.productName = name;
	this.glaze = glaze;
	
	this.total = num;
    }
}

// Cart. Can contain exactly one "ProductCount" per roll type

class Cart {
    constructor() {
	this.total = 0;

	this.orig = null;
	this.black = null;
	this.cara = null;
	this.wal = null;
	this.pump = null;
	this.glutFree = null;
    }
}

// Every page should load this to refresh the View Cart in the navbar

function loadPage(viewCart=false) {
    
    if (localStorage.getItem("myCart") === null) {
	cart = new Cart();
    } else {
	cart = JSON.parse(localStorage.getItem("myCart"));
    }

    var cartText;
    if (viewCart) {
	cartText = "<h3>YOUR CART (" + cart.total + " ITEMS)</h3>";
    } else {
	cartText = "<h3>VIEW CART (" + cart.total + ")</h3>";
    }

    document.getElementById("viewcart").innerHTML = cartText;
}

// Products page needs this to load stored cart into

function loadProducts() {
    if (cart.orig !== null) {
	document.getElementById("datc1").innerHTML = "Change Order";
    }

    if (cart.black !== null) {
	document.getElementById("datc2").innerHTML = "Change Order";
    }

    if (cart.cara !== null) {
	document.getElementById("datc3").innerHTML = "Change Order";
    }

    if (cart.wal !== null) {
	document.getElementById("datc4").innerHTML = "Change Order";
    }

    if (cart.pump !== null) {
	document.getElementById("datc5").innerHTML = "Change Order";
    }

    if (cart.glutFree !== null) {
	document.getElementById("datc6").innerHTML = "Change Order";
    }
}

// Helper function that adds or changes items to/in cart, called by addToCart

function cartAdd(newPC) {
    var old_val;
    var to_subt;
    var to_add;

    if (newPC.productName === "Original Cinnamon Rolls") {
	old_val = cart.orig;
	cart.orig = newPC;
    } else if (newPC.productName === "Blackberry Rolls") {
	old_val = cart.black;
	cart.black = newPC;
    } else if (newPC.productName === "Caramel Pecan Rolls") {
	old_val = cart.cara;
	cart.cara = newPC;
    } else if (newPC.productName === "Walnut Rolls") {
	old_val = cart.wal;
	cart.wal = newPC;
    } else if (newPC.productName === "Pumpkin Spice Rolls") {
	old_val = cart.pump;
	cart.pump = newPC;
    } else if (newPC.productName === "Original (Gluten-Free) Rolls") {
	old_val = cart.glutFree;
	cart.glutFree = newPC;
    }
    
    if (old_val === null) {
	to_subt = 0;
    } else {
	to_subt = old_val.total;
    }

    to_add = newPC.total;

    cart.total = cart.total + to_add - to_subt;

}

// Function that adds/changes product in cart. Can be called by multiple buttons on multiple pages.

function addToCart(dispButton,atcName) {
    
    var atcSelects = dispButton.parentElement.getElementsByTagName("SELECT");
    var atcGlaze = atcSelects[0].value;
    var atcNum = atcSelects[1].value.replace("roll","");

    //I do not have the full error messages for this programmed in yet, but I did make sure we can't add null values to the cart.

    if (atcNum !== "errn" && atcGlaze !== "errg") {
	var productToAdd = new ProductCount(atcName,atcGlaze,parseInt(atcNum));
	cartAdd(productToAdd);

	localStorage.setItem("myCart",JSON.stringify(cart));
	loadPage();
    }

}

// Wrapper function. Grabs necessary information from productbrowse.html and passes along to addToCart

function addToCartDisp(dispButton) {
    var atcName = dispButton.parentElement.getElementsByClassName("productname")[0].innerText;

    addToCart(dispButton,atcName);
    
    loadProducts();
}

// Wrapper function. Grabs necessary information from productdetails.html and passes along to addToCart

function addToCartDet() {
    var dispNode = document.getElementById("detailrighttop");
    var atcName = localStorage.getItem("productName");

    addToCart(dispNode,atcName);
    window.location = "productbrowse.html";
}

// Wrapper function. Grabs necessary information from viewcart.html, passes along to addToCart, and then updates the viewcart page to reflect the new choices.

function addToCartView(dispButton) {
    
    var atcName = dispButton.parentElement.getElementsByClassName("productname")[0].innerText;

    addToCart(dispButton,atcName);

    var atcSelects = dispButton.parentElement.getElementsByTagName("SELECT");
    var atcLabels = dispButton.parentElement.getElementsByTagName("LABEL");

    var glazeVal = atcSelects[0].value;
    var glazeLabel;
    if (glazeVal === "noglaze") {
	glazeLabel = "None";
    } else if (glazeVal === "sugar") {
	glazeLabel = "Sugar-milk";
    } else if (glazeVal === "vanilla") {
	glazeLabel = "Vanilla-milk";
    } else if (glazeVal === "doublechoc") {
	glazeLabel = "Double-chocolate";
    }

    atcLabels[0].innerHTML = "Glaze: " + glazeLabel;

    var numVal = atcSelects[1].value;
    var numLabel;
    if (numVal === "1roll") {
	numLabel = "1 roll";
    } else if (numVal === "3roll") {
	numLabel = "3 rolls";
    } else if (numVal === "6roll") {
	numLabel = "6 rolls";
    } else if (numVal === "12roll") {
	numLabel = "12 rolls";
    }

    atcLabels[1].innerHTML = "Amount: " + numLabel;
}

// Function to completely remove an order from the cart. This function changes the underlying cart value, then refreshes the page without the item that has just been removed. If this action would make the cart completely empty, it changes page to "empty page" format.

function removeFromCartView(removeNode,productName) {
    if (productName === "Original Cinnamon Rolls") {
	cart.total = cart.total - cart.orig.total;
	cart.orig = null;
    } else if (productName === "Blackberry Rolls") {
	cart.total = cart.total - cart.black.total;
	cart.black = null;
    } else if (productName === "Caramel Pecan Rolls") {
	cart.total = cart.total - cart.cara.total;
	cart.cara = null;
    } else if (productName === "Walnut Rolls") {
	cart.total = cart.total - cart.wal.total;
	cart.wal = null;
    } else if (productName === "Pumpkin Spice Rolls") {
	cart.total = cart.total - cart.pump.total;
	cart.pump = null;
    } else if (productName === "Original (Gluten-Free) Rolls") {
	cart.total = cart.total - cart.glutFree.total;
	cart.glutFree = null;
    }

    localStorage.setItem("myCart",JSON.stringify(cart));
    loadPage(true);

    removeNode.remove();

    if (cart.total === 0) {
	var allCart = document.getElementById("allcart");
	var emptyCart = document.createElement("div");
	emptyCart.id = "emptycart";
	var header = document.createElement("h3");
	header.innerText = "YOUR CART IS EMPTY";
	
	emptyCart.appendChild(header);
	allCart.appendChild(emptyCart);
	
	var totalPrice = document.getElementById("totalprice");
	totalPrice.innerHTML = "";
	var checkoutButton = document.getElementById("proceedtocheckout");
	checkoutButton.remove();
    }

}

// Grabs specific product info for productdetails.html from browse page.

function toDetails(parentNode) {

    var nodeName = parentNode.getElementsByClassName("productname")[0].innerText;
    var nodePrice = parentNode.getElementsByClassName("productprice")[0].innerText.replace("/roll","");
    var nodeImage = parentNode.getElementsByTagName("IMG")[0];
    var nodeSource = nodeImage.src;
    var nodeAlt = nodeImage.alt;

    localStorage.setItem("productName",nodeName);
    localStorage.setItem("productPrice",nodePrice);
    localStorage.setItem("productSource",nodeSource);
    localStorage.setItem("productAlt",nodeAlt);
}

// Wrapper function. If user clicks image in productbrowse.html, grabs necessary information and calls toDetails

function toDetailsFromImage(clickedImage) {
    var ciParent = clickedImage.parentElement;

    toDetails(ciParent);
}

// Wrapper function. If user clicks product text in productbrowse.html, grabs necessary information and calls toDetails

function toDetailsFromText(clickedText) {
    var ctParent = clickedText.parentNode.parentNode;

    toDetails(ctParent);
}

// Loads specific product information when user gets to productdetails.html

function setProduct() {
    document.getElementById("detailproductname").innerHTML = "<h2>" + localStorage.getItem("productName") + "</h2>";
    document.getElementById("detailprice").innerHTML = localStorage.getItem("productPrice");
    var setImage = document.getElementsByTagName("IMG")[0];
    setImage.src = localStorage.getItem("productSource");
    setImage.alt = localStorage.getItem("productAlt");
}

// We use this to access the underlying product information that is built by the code when loading the website. Note that if this site had a larger inventory we would use a database and directly lookup these values, but for this small an inventory we can manage with this set of productInfo objects.

function productInfoLookup(productName) {
    if (productName === "Original Cinnamon Rolls") {
	return originalInfo;
    } else if (productName === "Blackberry Rolls") {
	return blackberryInfo;
    } else if (productName === "Caramel Pecan Rolls") {
	return caramelInfo;
    } else if (productName === "Walnut Rolls") {
	return walnutInfo;
    } else if (productName === "Pumpkin Spice Rolls") {
	return pumpkinInfo;
    } else if (productName === "Original (Gluten-Free) Rolls") {
	return glutenFreeInfo;
    } else {
	return null;
    }
}

// Builds a new cart display for each possible item. Because each cartitem looks the same we can call this function multiple times.

function showCartItem(productName,glaze,amount,count) {
    var productInfo = productInfoLookup(productName);

    var allCart = document.getElementById("allcart");

    var newCartItem = document.createElement("div");
    newCartItem.className = "cartitem";
    allCart.appendChild(newCartItem);

    var newCartLeft = document.createElement("div");
    newCartLeft.className = "cartleft";
    newCartItem.appendChild(newCartLeft);


    var newImg = document.createElement("img");
    newImg.src = productInfo.source;
    newImg.alt = productInfo.alt;
    newCartLeft.appendChild(newImg);

    var newCartMid = document.createElement("div");
    newCartMid.className = "cartmid";
    newCartItem.appendChild(newCartMid);

    var newProductName = document.createElement("div");
    newProductName.className = "productname";
    newCartMid.appendChild(newProductName);
    
    var newTitle = document.createElement("p");
    var newTitleText = document.createTextNode(productName);
    newTitle.appendChild(newTitleText);
    newProductName.appendChild(newTitle);

    var newMidRows = document.createElement("midrows");
    newMidRows.className = "midrows";
    newCartMid.appendChild(newMidRows);

    var newGlazeLabel = document.createElement("label");
    newGlazeLabel.for = "glaze" + String(count);

    var glazeVal;
    if (glaze === "noglaze") {
	glazeVal = "None";
    } else if (glaze === "sugar") {
	glazeVal = "Sugar-milk";
    } else if (glaze === "vanilla") {
	glazeVal = "Vanilla-milk";
    } else if (glaze === "doublechoc") {
	glazeVal = "Double-chocolate";
    }
    
    newGlazeLabel.innerHTML = "Glaze: " + glazeVal;
    newMidRows.appendChild(newGlazeLabel);

    var newGlazeSelect = document.createElement("select");
    newGlazeSelect.name = "glaze" + String(count);
    newGlazeSelect.id = "glaze" + String(count);
    newMidRows.appendChild(newGlazeSelect);

    var newGO1 = document.createElement("option");
    newGO1.value = "errg";
    newGO1.innerHTML = "-";
    newGlazeSelect.appendChild(newGO1);

    var newGO2 = document.createElement("option");
    newGO2.value = "noglaze";
    newGO2.innerHTML = "None";
    newGlazeSelect.appendChild(newGO2);

    var newGO3 = document.createElement("option");
    newGO3.value = "sugar";
    newGO3.innerHTML = "Sugar-milk";
    newGlazeSelect.appendChild(newGO3);

    var newGO4 = document.createElement("option");
    newGO4.value = "vanilla";
    newGO4.innerHTML = "Vanilla-milk";
    newGlazeSelect.appendChild(newGO4);

    var newGO5 = document.createElement("option");
    newGO1.value = "doublechoc";
    newGO1.innerHTML = "Double-chocolate";
    newGlazeSelect.appendChild(newGO5);

    var newAmountLabel = document.createElement("label");
    newAmountLabel.for = "amount" + String(count);

    var amountVal;
    if (amount === 1) {
	amountVal = "1 roll";
    } else {
	amountVal = String(amount) + " rolls";
    }

    newAmountLabel.innerHTML = "Amount: " + amountVal;
    newMidRows.appendChild(newAmountLabel);

    var newAmountSelect = document.createElement("select");
    newAmountSelect.name = "num" + String(count);
    newAmountSelect.id = "num" + String(count);
    newMidRows.appendChild(newAmountSelect);

    var newNO1 = document.createElement("option");
    newNO1.value = "errn";
    newNO1.innerHTML = "-";
    newAmountSelect.appendChild(newNO1);

    var newNO2 = document.createElement("option");
    newNO2.value = "1roll";
    newNO2.innerHTML = "1";
    newAmountSelect.appendChild(newNO2);

    var newNO3 = document.createElement("option");
    newNO3.value = "3roll";
    newNO3.innerHTML = "3";
    newAmountSelect.appendChild(newNO3);

    var newNO4 = document.createElement("option");
    newNO4.value = "6roll";
    newNO4.innerHTML = "6";
    newAmountSelect.appendChild(newNO4);

    var newNO5 = document.createElement("option");
    newNO1.value = "12roll";
    newNO1.innerHTML = "12";
    newAmountSelect.appendChild(newNO5);

    var newPrice = document.createElement("p");
    newPrice.innerHTML = "Total: $X.XX";
    newCartMid.appendChild(newPrice);

    var newCartRight = document.createElement("div");
    newCartRight.className = "cartright";
    newCartItem.appendChild(newCartRight);

    var newChangeButton = document.createElement("button");
    newChangeButton.innerHTML = "Change Order";
    newChangeButton.onclick = function() {
	addToCartView(newCartRight);
    }
    newCartRight.appendChild(newChangeButton);

    var newRemoveButton = document.createElement("button");
    newRemoveButton.innerHTML = "Remove From Cart";
    newRemoveButton.onclick = function() {
	removeFromCartView(newCartRight.parentElement,productName);
    }
    newCartRight.appendChild(newRemoveButton);
  
}

// Loads the initial cart when user accesses viewcart page.

function showCart() {
 // We want the website to stick to the "empty cart" view if the cart is empty

    if (cart.total === 0) {
	return null;
    }
    
    var emptyCart = document.getElementById("emptycart");
    emptyCart.remove();

    // Count is just to make sure our dropdown menus have unique ids
    var count = 1;

    if (cart.orig !== null) {
	showCartItem("Original Cinnamon Rolls",cart.orig.glaze,cart.orig.total,count);
	count = count + 1;
    }

    if (cart.black !== null) {
	showCartItem("Blackberry Rolls",cart.black.glaze,cart.black.total,count);
	count = count + 1;
    }

    if (cart.cara !== null) {
	showCartItem("Caramel Pecan Rolls",cart.cara.glaze,cart.cara.total,count);
	count = count + 1;
    }

    if (cart.wal !== null) {
	showCartItem("Walnut Rolls",cart.wal.glaze,cart.wal.total,count);
	count = count + 1;
    }

    if (cart.pump !== null) {
	showCartItem("Pumpkin Spice Rolls",cart.pump.glaze,cart.pump.total,count);
	count = count + 1;
    }

    if (cart.glutFree !== null) {
	showCartItem("Original (Gluten-Free) Rolls",cart.glutFree.glaze,cart.glutFree.total,count);
	count = count + 1;
    }

    var totalPrice = document.getElementById("totalprice");
    totalPrice.innerHTML = "<p>TOTAL: $XX.XX</p>";
    var buttonBar = document.getElementById("buttonbar");
    var newCheckoutButton = document.createElement("button");
    newCheckoutButton.id = "proceedtocheckout";
    newCheckoutButton.innerHTML = "PROCEED TO CHECKOUT";
    buttonBar.appendChild(newCheckoutButton);
   
}

// Need to declare the global cart variable per each page and the details per product (if we had a larger inventory this would probably be accessed through a database), only thing that runs just with the script.

var cart;

var originalInfo = new ProductInfo("Original Cinnamon Rolls","ref_images/cinnamon1.jpg","Picture of an original-flavor cinnamon roll on a plate.","$X.XX");
var blackberryInfo = new ProductInfo("Blackberry Rolls","ref_images/cinnamon2.jpg","Picture of a blackberry-filled cinnamon roll on a plate.","$X.XX");
var caramelInfo = new ProductInfo("Caramel Pecan Rolls","ref_images/cinnamon3.jpg","Picture of a caramel-covered pecan cinnamon roll on a plate.","$X.XX");
var walnutInfo = new ProductInfo("Walnut Rolls","ref_images/cinnamon4.jpg","Picture of a walnut-filled cinnamon roll on a plate.","$X.XX");
var pumpkinInfo = new ProductInfo("Pumpkin Spice Rolls","ref_images/cinnamon5.jpg","Picture of a pumpkin spice cinnamon roll on a plate.","$X.XX");
var glutenFreeInfo = new ProductInfo("Original (Gluten-Free) Rolls","ref_images/cinnamon6.jpg","Picture of a gluten-free original flavor cinnamon roll on a plate.","$X.XX");
