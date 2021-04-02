// Object constructor to track glaze and amount per roll type

class ProductCount {
    constructor(name,glaze,num) {
 
	this.productName = name;
	this.glaze = glaze;

	// This setup keeping track of all the glazes is only going to be necessary once we execute the View Cart page
	
	/* this.noGlaze = 0;
	this.sugarMilk = 0;
	this.vanillaMilk = 0;
	this.doubleChoc = 0;
	
	if (glaze === "noglaze") {
	    this.noGlaze = num;
	} else if (glaze === "sugar") {
	    this.sugarMilk = num;
	} else if (glaze === "vanilla") {
	    this.vanillaMilk = num;
	} else if (glaze === "doublechoc") {
	    this.doublechoc = num;
	} */
	
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

function loadPage() {
    
    if (localStorage.getItem("myCart") === null) {
	cart = new Cart();
    } else {
	cart = JSON.parse(localStorage.getItem("myCart"));
    }

    document.getElementById("viewcart").innerHTML = "<h3>VIEW CART (" + cart.total + ")</h3>";
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

// Need to declare the global cart variable per each page, only thing that runs just with the script.

var cart;
