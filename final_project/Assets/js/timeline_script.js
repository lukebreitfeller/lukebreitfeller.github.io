// Object constructor for nodes.

class UnsortedNode {
    constructor(event,idx,bucket) {
	this.eventList = [event];
	this.idx = idx;
	this.bucket = bucket;
	this.befores = null;
	this.afters = null;
    }
}

class SortedNode {
    constructor(event,idx) {
	this.eventList = [event];
	this.idx = idx;
    }
}

// Global values to track text, nodes, and sorted timeline.

var globalNodes = [];

var timeline;

var pastBucket;
var futureBucket;

var savedText;

///////////////////////////////////////////////////////////////////////
// Functions dealing with the loading and reloading of information ////
///////////////////////////////////////////////////////////////////////


// Function called anytime the page gets resized. Unfortunately there is a lot that needs to be reformatted in very specific ways if the window gets made too small (< 750 px).
function resizePage() {
    var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    var timelineElem = document.getElementById("timeline");    
    var arrowRow = document.getElementById("arrowrow");
    var timelineList = document.getElementById("timelinelist");
    var timelineArrows = document.getElementsByClassName("timelinearrow");
    
    if (width < 750) {

	// If window gets too small, timeline is flipped on its side with dimensions inverted.
	timelineElem.style.gridTemplateRows = "1200px";
	timelineElem.style.gridTemplateColumns = "100px 100px";
	timelineElem.style.height = "1200px";
	timelineElem.style.width = "200px";

	// Need to resize pieces of timeline based on how many unique sections currently exist.
	var arrowLen = Math.floor(1200/(timeline.length+1));

	var arrowStyle = "";
	for (var i = 0; i < timeline.length+1; i++) {
	    newString = " " + String(arrowLen) + "px";
	    arrowStyle = arrowStyle.concat(newString);
	}

	var nodeStyle = String(arrowLen-50) + "px";
	for (var i = 0; i < timeline.length; i++) {
	    newString = " " + String(arrowLen) + "px";
	    nodeStyle = nodeStyle.concat(newString);
	}

	// Pieces of timeline "arrow" also flip on their side.
	arrowRow.style.gridTemplateRows = arrowStyle;
	arrowRow.style.gridTemplateColumns = "50px";
	for (var i = 0; i < timelineArrows.length; i++) {
	    var thisArrow = timelineArrows[i];
	    thisArrow.style.width = "50px";
	    thisArrow.style.height = String(arrowLen) + "px";
	    thisArrow.style.borderWidth = "0 5px 0 0";
	}
	
	timelineList.style.gridTemplateRows = nodeStyle;
	timelineList.style.gridTemplateColumns = "100px";

	// Bottom row of information becomes two smaller rows.
	var bucketRow = document.getElementById("bucketrow");
	bucketRow.style.gridTemplateColumns = "350px 350px";
	bucketRow.style.gridTemplateRows = "350px 400px";
	
    } else {

	// If window was small and becomes big, timeline becomes horizontal.
	timelineElem.style.gridTemplateColumns = "1200px";
	timelineElem.style.gridTemplateRows = "100px 100px";
	timelineElem.style.height = "200px";
	timelineElem.style.width = "1200px";

	// Need to resize segments of full timeline.
	var arrowLen = Math.floor(1200/(timeline.length+1));

	var arrowStyle = "";
	for (var i = 0; i < timeline.length+1; i++) {
	    newString = " " + String(arrowLen) + "px";
	    arrowStyle = arrowStyle.concat(newString);
	}

	var nodeStyle = String(arrowLen-50) + "px";
	for (var i = 0; i < timeline.length; i++) {
	    newString = " " + String(arrowLen) + "px";
	    nodeStyle = nodeStyle.concat(newString);
	}

	// Pieces of timeline "arrow" flip horizontally.
	arrowRow.style.gridTemplateColumns = arrowStyle;
	arrowRow.style.gridTemplateRows = "50px";
	for (var i = 0; i < timelineArrows.length; i++) {
	    var thisArrow = timelineArrows[i];
	    thisArrow.style.width = String(arrowLen) + "px";
	    thisArrow.style.height = "50px";
	    thisArrow.style.borderWidth = "0 0 5px 0";
	}
	
	timelineList.style.gridTemplateColumns = nodeStyle;
	timelineList.style.gridTemplateRows = "50px";

	// Bottom row of information becomes single row.
	var bucketRow = document.getElementById("bucketrow");
	bucketRow.style.gridTemplateColumns = "400px 400px 400px";
	bucketRow.style.gridTemplateRows = "400px";

    }
}

// Function that is called every time the timeline is updated.
function refreshTimeline() {    
    var tlArrowRow = document.getElementById("arrowrow");
    var tlArrows = tlArrowRow.getElementsByClassName("timelinearrow");

    // Delete all the segments and events currently in the timeline.
    // Because of javascript, we have to a second list in order to iteratively remove the
    // (It may be simpler in the future to remove and re-create the rows which contain these values, but there are a number of small formatting decisions throughout the entire webpage that could be affected by that. Getting the existing script running was enough of a challenge and I did not have time to gamble on the new method.)

    var statList = [];
    for (var i = 0; i < tlArrows.length; i++) {
	statList.push(tlArrows[i]);
    }

    for (var i = 0; i < statList.length; i++) {
	var tlArrow = statList[i];
	tlArrow.remove();
    }

    // Need to identify the correct lengths for each new segment and the events along the timeline.
    var arrowLen = Math.floor(1200/(timeline.length+1));

    var tlListRow = document.getElementById("timelinelist");
    var tlLists = tlListRow.getElementsByClassName("node");
    
    var statList2 = [];
    for (var i = 0; i < tlLists.length; i++) {
	statList2.push(tlLists[i]);
    }

    for (var i = 0; i < statList2.length; i++) {
	var tlList = statList2[i];
	tlList.remove();
    }

    var tlListError = document.getElementById("errbox");
    if (tlListError !== null) {
	tlListError.remove();
    }

    var finalCount;
    // Add full new values to timeline--adding everything at once ensures we don't have to worry about tracking the order, since that information is stored in the global timeline variable.
    for (var i = 0; i < timeline.length; i++) {
	var newTlArrow = document.createElement("div");
	newTlArrow.className = "timelinearrow";
	newTlArrow.id = "timeline" + String(i);
	newTlArrow.style.width = String(arrowLen) + "px";
	newTlArrow.ondrop = function(event) {
	    drop(event);
	}
	newTlArrow.ondragover = function(event) {
	    allowDrop(event);
	}
	newTlArrow.ondragenter = function(event) {
	    allowDrop(event);
	}
	tlArrowRow.appendChild(newTlArrow);

	nodeToTimeline(timeline[i]);
	finalCount = i+1;
    }

    // Because there are two timeline segments to each end of an event, we need one more extra segment of the timeline once all the events have been added.
    var newTlArrow = document.createElement("div");
    newTlArrow.className = "timelinearrow";
    newTlArrow.id = "timeline" + String(finalCount);
    newTlArrow.style.width = String(arrowLen) + "px";
    newTlArrow.ondrop = function(event) {
	drop(event);
    }
    newTlArrow.ondragover = function(event) {
	allowDrop(event);
    }
    newTlArrow.ondragenter = function(event) {
	allowDrop(event);
    }
    tlArrowRow.appendChild(newTlArrow);

    // Apply style to ensure each timeline segment and event is at correct position.
    var arrowStyle = "";
    for (var i = 0; i < timeline.length+1; i++) {
	newString = " " + String(arrowLen) + "px";
	arrowStyle = arrowStyle.concat(newString);
    }

    tlArrowRow.style.gridTemplateColumns = arrowStyle;

    // We want each new event's left edge to be at the same point as the start of a new timeline segment. However, the first should be shifted 50px left so the event is "centered" on the edge of the segments.
    var nodeStyle = String(arrowLen-50) + "px";
    for (var i = 0; i < timeline.length; i++) {
	newString = " " + String(arrowLen) + "px";
	nodeStyle = nodeStyle.concat(newString);
    }

    tlListRow.style.gridTemplateColumns = nodeStyle;

    // When new events are placed on the timeline, the existing data about which timeline segments are "bad" should be reformatted back to "good".
    var badTimelineList = document.getElementsByClassName("timelinearrow bad");
    for (var i = 0; i < badTimelineList.length; i++) {
	badTimelineList[i].className = "timelinearrow";
    }

    var badBucket = document.getElementsByClassName("reduced node bad");
    for (var i = 0; i < badBucket.length; i++) {
	badBucket[i].className = "reduced node";
    }

    // We call "resizePage" every time the timeline is updated because all of the above code assumes a horizontal orientation, which may not be true.
    // (Future implementations will go through and trim all the parts of this function defining values which get more specifically defined later by resizePage. At this point in the project, however, there's a lot of code running and making sure it is baseline-functional is the priority)
    resizePage();

}

// The function which takes an individual node from the global timeline list and adds it to the timeline. This is called iteratively by refreshTimeline only.
function nodeToTimeline(node) {
    if (node === "ERROR") {
	buildError();
	return null;
    }
    
    var tlList = document.getElementById("timelinelist");

    var newElement = document.createElement("div");
    newElement.className = "reduced node";
    newElement.id = "sortnode" + String(node.idx);
    newElement.draggable = "true";
    newElement.onclick = function () {
	expandNode(newElement);
    };
    newElement.innerHTML = "<p>" + node.eventList[0] + "</p>";

    tlList.appendChild(newElement);

}

// Function that is called every time the buckets are updated or collapsed.
function loadBuckets() {
    
    var pbElement = document.getElementById("pastbucket");
    var pbNodes = pbElement.getElementsByClassName("node");

    // Removing old nodes from bucket.
    var statList = [];
    for (var i = 0; i < pbNodes.length; i++) {
	statList.push(pbNodes[i]);
    }

    for (var i = 0; i < statList.length; i++) {
	var pbNode = statList[i];
	pbNode.remove();
    }

    // We want to grab only the first 3 elements because the collapsed window is small.
    var shortPB;
    if (pastBucket.length <= 3) {
	shortPB = pastBucket;
    } else {
	shortPB = pastBucket.slice(0,3);
    }
    
    shortPB.forEach(function(value) {
	nodeToBucket(value,pbElement);
    });

    // Adding the button to expand the bucket.
    if (document.getElementById("pbexpand") === null) {
	var openPB = document.createElement("div");
	openPB.id = "pbexpand";
	openPB.className = "boxexpand";
	openPB.innerHTML = "<h3>. . .</h3>";
	openPB.onclick = function () {
	    expandBucket("pastbucket");
	}
	pbElement.appendChild(openPB);
    }

    var fbElement = document.getElementById("futurebucket");
    var fbNodes = fbElement.getElementsByClassName("node");

    // Removing old nodes
    var statList2 = [];
    for (var i = 0; i < fbNodes.length; i++) {
	statList2.push(fbNodes[i]);
    }

    for (var i = 0; i < statList2.length; i++) {
	var fbNode = statList2[i];
	fbNode.remove();
    }

    // We want to only grab the first 3 elements in the bucket.
    var shortFB;
    if (futureBucket.length <= 3) {
	shortFB = futureBucket;
    } else {
	shortFB = futureBucket.slice(0,3);
    }
    
    shortFB.forEach(function(value) {
	nodeToBucket(value,fbElement);
    });

    // Adding the button to expand the bucket.
    if (document.getElementById("fbexpand") === null) {
	var openFB = document.createElement("div");
	openFB.id = "fbexpand";
	openFB.className = "boxexpand";
	openFB.innerHTML = "<h3>. . .</h3>";
	openFB.onclick = function () {
	    expandBucket("futurebucket");
	}
	fbElement.appendChild(openFB);
    }
}

// The function which takes an individual node from the global buckets lists and adds it to the bucket element. This is called iteratively by loadBuckets only.
function nodeToBucket(node,bucketElement) {
    var nodeBlock = bucketElement.getElementsByClassName("nodeblock")[0];

    // Need to assign the element the global id for the event--necessary to properly reference properties for that event on later clicks.
    var newElement = document.createElement("div");
    newElement.className = "reduced node unsort";
    newElement.id = "unsortnode" + String(node.idx);
    newElement.draggable = "true";
    newElement.onclick = function () {
	expandNode(newElement);
    };
    newElement.ondragstart = function(event) {
	drag(event);
    }
    newElement.innerHTML = "<p>" + node.eventList[0] + "</p>";

    nodeBlock.appendChild(newElement);
}

//////////////////////////////////////////////////////////////
// Functions dealing with dragging and dropping events ///////
//////////////////////////////////////////////////////////////

// The drag function. Calls the same function activated by clicking the node, also grabs the necessary information about the event for a future drop.
function drag(ev) {
    var nodeID = ev.target.id.replace("sortnode","");
    nodeID = nodeID.replace("un","");
    var selectedNode = globalNodes[nodeID];
    
    badTimeline(selectedNode);
    ev.dataTransfer.setData("text",ev.target.id);
}

// Allows drop.
function allowDrop(ev) {
    ev.preventDefault();
}

// Drop function. We need the drop function to either immediately call the function which adds an event to the timeline after dropping it, or for the function to call the error message which appears when placing an event on a "bad" timeline segment and save information which may be used later if the user overrides the error message.
function drop(ev) {
    ev.preventDefault();

    var target = ev.target;

    if (target.className.includes("timelinearrow")) {

	if (target.className.includes("bad")) {
	    var tlSegment = parseInt(target.id.replace("timeline",""));
	    timeline.splice(tlSegment,0,"ERROR");

	    // The above code just added an error box to the timeline, we need to refresh to view that error box.
	    refreshTimeline();

	    // Saves the data in case the error is overriden.
	    sessionStorage.setItem("errDropSeg",target.id);
	    sessionStorage.setItem("errDropNode",ev.dataTransfer.getData("text"));

	} else {
	    // Directly calls the function to add event to timeline.
	    dropObject(target.id,ev.dataTransfer.getData("text"));
	}
    }
}

// Function which takes the information about an event, and uses it to add the event to the timeline.
function dropObject(evTargetText,evText) {    
    var tlSegment = parseInt(evTargetText.replace("timeline",""));
    var unsortNodeId = parseInt(evText.replace("unsortnode",""));
    var unsortNodeElem = document.getElementById(evText);

    // This is the global value of the event, identifiable through the id number linked to the id of the document element representing the event. We use this like we would use lookups to some larger web database, to store information not shown on the document itself.
    var unsortNode = globalNodes[unsortNodeId];

    // Removing node from its unsorted bucket.
    var unsortIdx;
    if (unsortNode.bucket === "past") {
	unsortIdx = getBucketIndex(unsortNodeId,pastBucket);
	pastBucket.splice(unsortIdx,1);
    } else if (unsortNode.bucket === "future") {
	unsortIdx = getBucketIndex(unsortNodeId,futureBucket);
	futureBucket.splice(unsortIdx,1);
    }

    // Building new sorted node and adding it in the correct position in the global timeline.
    var sortNode = new SortedNode(null,unsortNode.idx);
    sortNode.eventList = unsortNode.eventList;

    unsortNodeElem.remove();
    timeline.splice(tlSegment,0,sortNode);

    // Changing the highlight of the event in the textbox.
    var eventMention = document.getElementById("event" + String(sortNode.idx));
    eventMention.className = eventMention.className.replace("unsorted","sorted");

    // We need to reload both the buckets and the timeline to make sure they update at the correct time.
    loadBuckets();
    refreshTimeline();

}

// Wrapper function which retrieves stored information about the last dragged event. This is necessary for cases where the drag-and-drop has been interrupted by an error box.
function dropStoredObject() {
    var storedSeg = sessionStorage.getItem("errDropSeg");
    var storedNode = sessionStorage.getItem("errDropNode");

    dropObject(storedSeg,storedNode);
}

// Helper function which finds the index of a event in the pastBucket or futureBucket lists. Necessary to make sure the correct event gets removed from the unsorted event pile.
function getBucketIndex(nodeID,bucket) {    
    for (var i = 0; i < bucket.length; i++) {
	if (bucket[i].idx === nodeID) {
	    return i;
	}
    }

    return null;
}

// Functions dealing with the error box.

// Function which creates the error box. Error box will either call a function which takes data about the last dragged event and passes it to the function which adds event to the timeline, or remove itself while changing nothing.
// This function is only called by refreshTimeline, which also reloads the timeline on the desktop display.
function buildError() {
    var timelineListRow = document.getElementById("timelinelist");
    
    var errBox = document.createElement("div");
    errBox.id = "errbox";
    timelineListRow.appendChild(errBox);

    var errBoxText = document.createElement("div");
    errBoxText.innerHTML = "<p>Previous info says this element should not go here. Place element anyways?</p>";
    errBox.appendChild(errBoxText);

    var errBoxButtons = document.createElement("div");
    errBoxButtons.id = "errboxbuttons";
    errBox.appendChild(errBoxButtons);

    var errBoxYes = document.createElement("button");
    errBoxYes.innerHTML = "Yes";
    // If user overrides error, calls dropStoredObject, then removes error box.
    errBoxYes.onclick = function () {
	dropStoredObject();
	removeError();
    }
    errBoxButtons.appendChild(errBoxYes);

    var errBoxNo = document.createElement("button");
    errBoxNo.innerHTML = "No";
    // If user does not override error, nothing changes but error box should be removed.
    errBoxNo.onclick = function () {
	removeError();
    }
    errBoxButtons.appendChild(errBoxNo);
    
}

// Removes error box from timeline.
function removeError() {
    sessionStorage.removeItem("errDropSeg");
    sessionStorage.removeItem("errDropNode");

    var errIdx = timeline.indexOf("ERROR");
    timeline.splice(errIdx,1);

    // Need to refresh timeline to view new error box.
    refreshTimeline();
}

//////////////////////////////////////////////////
// Functions dealing with when we click event ////
//////////////////////////////////////////////////

// Function which shows all the "invalid" segments of a timeline for a given event, activates when user clicks or drags event.
function expandNode(node) {

// This function has a lot of commented code. This is because the code is used for a feature that was removed from this implementation but which I plan to add again later.

    // If one event has been clicked, we want all the visual information from any other clicked node to disappear.
    reduceAllNodes();
    
    node.className = "expanded node unsort";
//    node.innerHTML = "";
    node.onclick = function () {
	reduceNode(node);
    };

//    var insideElement = document.createElement("div");
//    insideElement.className = "eventblock";
//    node.appendChild(insideElement);

    // We need to grab some hidden information from the global representation of the event. We need to be able to grab the id X from elements whose id is either in format "sortnodeX" or "unsortnodeX"
    var nodeID = node.id.replace("sortnode","");
    nodeID = nodeID.replace("un","");
    var selectedNode = globalNodes[nodeID];

//    for (var i = 0; i < selectedNode.eventList.length; i++) {
//	var newText = document.createElement("div");
//	newText.innerHTML = "<p>" + selectedNode.eventList[i] + "<p>";
//	insideElement.appendChild(newText);
//    }

    // Highlight all "bad" parts of timeline.
    badTimeline(selectedNode);

}

// Finds the last node which has been clicked and "un-clicks" it. We need to do this before we can "click" a new event.
function reduceAllNodes() {
    var expandedNodes = document.getElementsByClassName("expanded node");

    if (expandedNodes.length === 0) {
	return null;
    }

    reduceNode(expandedNodes[0]);
}

// Removes all the highlighted information for a given "currently clicked" node.
function reduceNode(node) {

    // This function has many commented lines of code. This code is used for a feature I took out of the final project but want to re-implement in the future.
    
    node.className = node.className.replace("expanded","reduced");
    node.onclick = function () {
	expandNode(node);
    };

//    var nodeID = node.id.replace("sortnode","");
//    nodeID = nodeID.replace("un","");
//    var selectedNode = globalNodes[nodeID];
//    node.innerHTML = "<p>" + selectedNode.eventList[0] + "</p>";

    // Change any element which currently has "bad" in its class name. We have to loop once to build a static list and a second time to make the change because of how javascript handles arrays.
    var badTimelineList = document.getElementsByClassName("timelinearrow bad");
    var statList = [];
    for (var i = 0; i < badTimelineList.length; i++) {
	statList.push(badTimelineList[i]);
    }

    for (var i = 0; i < statList.length; i++) {
	var btList = statList[i];
	btList.className = "timelinearrow";
    }

    var badBucket = document.getElementsByClassName("reduced node bad");
    var statList2 = [];
    for (var i = 0; i < badBucket.length; i++) {
	statList2.push(badBucket[i]);
    }

    for (var i = 0; i < statList2.length; i++) {
	var bBucket = statList2[i];
	bBucket.className = bBucket.className.replace("bad","");
    }
    
}

// Identifies which pieces of the timeline are considered "bad" for a given node. If the node is in the past bucket, this will be all segments after the "Present" node and all nodes in the future bucket. If future, this will be all segments before the "Present" and nodes in past bucket.
function badTimeline(selectedNode) {    
    var presentIdx = null;

    // Find the present node in the timeline.
    for (var i = 0; i < timeline.length; i++) {
	if (timeline[i].eventList.includes("Present")) {
	    presentIdx = i;
	}
    }

    // Adding "bad" to the class of a timeline arrow or a node will load a new style which includes a red X over the element.
    var timelineArrows = document.getElementsByClassName("timelinearrow");
    if (selectedNode.bucket === "past") {
	for (var i = presentIdx + 1; i < timeline.length + 1; i++) {
	    timelineArrows[i].className = "timelinearrow bad";
	}

	var futureBucket = document.getElementById("futurebucket");
	var fbNodes = futureBucket.getElementsByClassName("node");
	for (var i = 0; i < fbNodes.length; i++) {
	    fbNodes[i].className = fbNodes[i].className + " bad";
	}
    } else if (selectedNode.bucket === "future") {
	for (var i = 0; i < presentIdx + 1; i++) {
	    timelineArrows[i].className = "timelinearrow bad";
	}

	var pastBucket = document.getElementById("pastbucket");
	var pbNodes = pastBucket.getElementsByClassName("node");
	for (var i = 0; i < pbNodes.length; i++) {
	    pbNodes[i].className = pbNodes[i].className + " bad";
	}
    }
}

/////////////////////////////////////////////////////////////
// Functions dealing with expanding/collapsing buckets //////
/////////////////////////////////////////////////////////////

// Function which expands either the past or future bucket.

function expandBucket(bucketName) {

    // Removing the collapsed bucket elements.
    var pbElement = document.getElementById("pastbucket");
    var fbElement = document.getElementById("futurebucket");
    
    pbElement.remove();
    fbElement.remove();

    // Need to remove the text box first so we can add the elements again in the correct order. We store the exact innerHTML for this.
    var textBox = document.getElementById("textbox");
    var storeText = textBox.innerHTML;
    textBox.remove();

    // New style for the bucket row.
    var bucketRow = document.getElementById("bucketrow");
    bucketRow.style.gridTemplateColumns = "800px 400px";

    // Building new large bucket.
    var newBucket = document.createElement("div");
    newBucket.className = "large bucket";
    newBucket.id = bucketName;
    bucketRow.appendChild(newBucket);

    var bucketHeaderRow = document.createElement("div");
    bucketHeaderRow.id = "largebuckettop";
    newBucket.appendChild(bucketHeaderRow);
    newBucket.append(bucketHeaderRow);
    
    var bucketHeader = document.createElement("h3");
    if (bucketName === "pastbucket") {
	bucketHeader.innerHTML = "Events In The Past";
    } else if (bucketName === "futurebucket") {
	bucketHeader.innerHTML = "Events In The Future";
    }
    bucketHeaderRow.appendChild(bucketHeader);

    // X which closes bucket.
    var bucketExit = document.createElement("h3");
    bucketExit.innerHTML = "X";
    bucketExit.onclick = function () {
	reduceBucket(newBucket);
    }
    bucketHeaderRow.appendChild(bucketExit);
    
    var newBlock = document.createElement("div");
    newBlock.className = "large nodeblock";
    newBucket.appendChild(newBlock);

    if (bucketName === "pastbucket") {
	pastBucket.forEach(function(value) {
	    nodeToBucket(value,newBucket);
	});	
    } else if (bucketName === "futurebucket") {
	futureBucket.forEach(function(value) {
	    nodeToBucket(value,newBucket);
	});
    }

    // Adding textbox again.
    var newTextBox = document.createElement("div");
    newTextBox.id = "textbox";
    newTextBox.innerHTML = storeText;
    bucketRow.appendChild(newTextBox);

}

// Collapses bucket again.
function reduceBucket(bucketElement) {

    // Functionally the reverse of the above function.
    bucketElement.remove();

    var textBox = document.getElementById("textbox");
    var storeText = textBox.innerHTML;
    textBox.remove();

    var bucketRow = document.getElementById("bucketrow");
    bucketRow.style.gridTemplateColumns = "400px 400px 400px";
    
    var pbElement = document.createElement("div");
    pbElement.className = "bucket";
    pbElement.id = "pastbucket";
    bucketRow.appendChild(pbElement);

    var fbElement = document.createElement("div");
    fbElement.className = "bucket";
    fbElement.id = "futurebucket";
    bucketRow.appendChild(fbElement);

    var newTextBox = document.createElement("div");
    newTextBox.id = "textbox";
    newTextBox.innerHTML = storeText;
    bucketRow.appendChild(newTextBox);
    
    var pbHeader = document.createElement("h3");
    pbHeader.innerHTML = "Events In The Past";
    pbElement.appendChild(pbHeader);

    var pbNodeBlock = document.createElement("div");
    pbNodeBlock.className = "nodeblock";
    pbElement.appendChild(pbNodeBlock);

    var fbHeader = document.createElement("h3");
    fbHeader.innerHTML = "Events In The Future";
    fbElement.appendChild(fbHeader);

    var fbNodeBlock = document.createElement("div");
    fbNodeBlock.className = "nodeblock";
    fbElement.appendChild(fbNodeBlock);

    loadBuckets();
}

// Called every time the page loads. Initializes global variables, loads visuals, readies everything for later input.
function initializePage() {

    // This tool really cannot be used effectively on a mobile screen, it's just too small. This code checks for a mobile implementation.
    
    var mobileBrowser = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (mobileBrowser) {
	var mobileWarning = document.createElement("div");
	mobileWarning.id = "mobilewarning";
	mobileWarning.innerHTML = "<h3>THIS TOOL IS ONLY USABLE THROUGH A DESKTOP BROWSER. PLEASE SWITCH TO DESKTOP.</h3>";
	document.body.innerHTML = "";
	document.body.appendChild(mobileWarning);
	return null;
    }

    // Want to call resize function each time size changes.
    window.onresize = function () {
	resizePage();
    }

    // Initializes variables if user is opening pages for first time that session.
    if (sessionStorage.getItem("globalNodes") === null) {
	pastBucket = [];
	futureBucket = [];

	var finalCount;

	var spanList = document.getElementsByTagName("span");

	// Converts highlighted text from the textBox object to events, builds global variables storing all known information for event.
	for (var i = 0; i < spanList.length; i++) {
	    
	    var eventName = spanList[i].innerHTML;
	    var spanBucket;

	    // The current implementation requires all span elements be given a class of "past" or "future"
	    if (spanList[i].className.includes("past")) {
		spanBucket = "past";
	    } else if (spanList[i].className.includes("future")) {
		spanBucket = "future";
	    }

	    var newEvent = new UnsortedNode(eventName,i,spanBucket);
	    globalNodes.push(newEvent);

	    if (spanList[i].className.includes("past")) {
		pastBucket.push(newEvent);
	    } else if (spanList[i].className.includes("future")) {
		futureBucket.push(newEvent);
	    }

	    spanList[i].id = "event" + String(i);

	    finalCount = i+1;

	}

	// We also need a sorted event representing "now". This builds that event.
	var presentEvent = new SortedNode("Present",finalCount);
	globalNodes.push(presentEvent);
	timeline = [presentEvent];
    	
    } else {
	// If the data already exists, load it instead.
	globalNodes = JSON.parse(sessionStorage.getItem("globalNodes"));
	timeline = JSON.parse(sessionStorage.getItem("timeline"));
	pastBucket = JSON.parse(sessionStorage.getItem("pastBucket"));
	futureBucket = JSON.parse(sessionStorage.getItem("futureBucket"));
	savedText = sessionStorage.getItem("savedText");

	var textBox = document.getElementById("textbox");
	textBox.innerHTML = savedText;
	
    }

    // Reload all visual elements of the page using the information generated about the timeline and buckets.
    refreshTimeline();
    loadBuckets();
    
}

// Stores necessary information when user clicks link to instruction page.
function toInstructions() {

    sessionStorage.setItem("globalNodes",JSON.stringify(globalNodes));
    sessionStorage.setItem("timeline",JSON.stringify(timeline));
    sessionStorage.setItem("pastBucket",JSON.stringify(pastBucket));
    sessionStorage.setItem("futureBucket",JSON.stringify(futureBucket));

    var textBox = document.getElementById("textbox");
    sessionStorage.setItem("savedText",textBox.innerHTML);

}
