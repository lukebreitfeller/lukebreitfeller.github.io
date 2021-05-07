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

var globalNodes = [];

var timeline;

var pastBucket;
var futureBucket;

var savedText;

function resizePage() {
    var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    var timelineElem = document.getElementById("timeline");    
    var arrowRow = document.getElementById("arrowrow");
    var timelineList = document.getElementById("timelinelist");
    var timelineArrows = document.getElementsByClassName("timelinearrow");
    
    if (width < 750) {

	timelineElem.style.gridTemplateRows = "1200px";
	timelineElem.style.gridTemplateColumns = "100px 100px";
	timelineElem.style.height = "1200px";
	timelineElem.style.width = "200px";

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

	var bucketRow = document.getElementById("bucketrow");
	bucketRow.style.gridTemplateColumns = "350px 350px";
	bucketRow.style.gridTemplateRows = "350px 400px";
	
    } else {

	timelineElem.style.gridTemplateColumns = "1200px";
	timelineElem.style.gridTemplateRows = "100px 100px";
	timelineElem.style.height = "200px";
	timelineElem.style.width = "1200px";
	
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

	var bucketRow = document.getElementById("bucketrow");
	bucketRow.style.gridTemplateColumns = "400px 400px 400px";
	bucketRow.style.gridTemplateRows = "400px";

    }
}

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

function refreshTimeline() {    
    var tlArrowRow = document.getElementById("arrowrow");
    var tlArrows = tlArrowRow.getElementsByClassName("timelinearrow");
    
    // Have to make a second list in order to go through this iteratively

    var statList = [];
    for (var i = 0; i < tlArrows.length; i++) {
	statList.push(tlArrows[i]);
    }

    for (var i = 0; i < statList.length; i++) {
	var tlArrow = statList[i];
	tlArrow.remove();
    }

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
    
    var count = 0;
    for (var i = 0; i < timeline.length; i++) {
	var newTlArrow = document.createElement("div");
	newTlArrow.className = "timelinearrow";
	newTlArrow.id = "timeline" + String(count);
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
	count++;
    }

    var newTlArrow = document.createElement("div");
    newTlArrow.className = "timelinearrow";
    newTlArrow.id = "timeline" + String(count);
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

    var arrowStyle = "";
    for (var i = 0; i < count+1; i++) {
	newString = " " + String(arrowLen) + "px";
	arrowStyle = arrowStyle.concat(newString);
    }

    tlArrowRow.style.gridTemplateColumns = arrowStyle;

    var nodeStyle = String(arrowLen-50) + "px";
    for (var i = 0; i < count; i++) {
	newString = " " + String(arrowLen) + "px";
	nodeStyle = nodeStyle.concat(newString);
    }

    tlListRow.style.gridTemplateColumns = nodeStyle;

    var badTimelineList = document.getElementsByClassName("timelinearrow bad");
    for (var i = 0; i < badTimelineList.length; i++) {
	badTimelineList[i].className = "timelinearrow";
    }

    var badBucket = document.getElementsByClassName("reduced node bad");
    for (var i = 0; i < badBucket.length; i++) {
	badBucket[i].className = "reduced node";
    }

    resizePage();

}

function drag(ev) {
    var nodeID = ev.target.id.replace("sortnode","");
    nodeID = nodeID.replace("un","");
    var selectedNode = globalNodes[nodeID];
    
    badTimeline(selectedNode);
    ev.dataTransfer.setData("text",ev.target.id);
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    ev.preventDefault();

    var target = ev.target;

    if (target.className.includes("timelinearrow")) {

	if (target.className.includes("bad")) {
	    var tlSegment = parseInt(target.id.replace("timeline",""));
	    timeline.splice(tlSegment,0,"ERROR");

	    refreshTimeline();
		
	    sessionStorage.setItem("errDropSeg",target.id);
	    sessionStorage.setItem("errDropNode",ev.dataTransfer.getData("text"));

	} else {
	    //ev.preventDefault();
	    dropObject(target.id,ev.dataTransfer.getData("text"));
	}
    }
}

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
    errBoxYes.onclick = function () {
	dropStoredObject();
	removeError();
    }
    errBoxButtons.appendChild(errBoxYes);

    var errBoxNo = document.createElement("button");
    errBoxNo.innerHTML = "No";
    errBoxNo.onclick = function () {
	removeError();
    }
    errBoxButtons.appendChild(errBoxNo);
    
}

function removeError() {
    sessionStorage.removeItem("errDropSeg");
    sessionStorage.removeItem("errDropNode");

    var errIdx = timeline.indexOf("ERROR");
    timeline.splice(errIdx,1);

    refreshTimeline();
}

function dropObject(evTargetText,evText) {    
    var tlSegment = parseInt(evTargetText.replace("timeline",""));
    var unsortNodeId = parseInt(evText.replace("unsortnode",""));
    var unsortNodeElem = document.getElementById(evText);

    var unsortNode = globalNodes[unsortNodeId];

    var unsortIdx;
    if (unsortNode.bucket === "past") {
	unsortIdx = getBucketIndex(unsortNodeId,pastBucket);
	pastBucket.splice(unsortIdx,1);
    } else if (unsortNode.bucket === "future") {
	unsortIdx = getBucketIndex(unsortNodeId,futureBucket);
	futureBucket.splice(unsortIdx,1);
    }

    var sortNode = new SortedNode(null,unsortNode.idx);
    sortNode.eventList = unsortNode.eventList;

    unsortNodeElem.remove();
    timeline.splice(tlSegment,0,sortNode);

    var eventMention = document.getElementById("event" + String(sortNode.idx));
    eventMention.className = eventMention.className.replace("unsorted","sorted");

    loadBuckets();
    refreshTimeline();

}

function getBucketIndex(nodeID,bucket) {    
    for (var i = 0; i < bucket.length; i++) {
	if (bucket[i].idx === nodeID) {
	    return i;
	}
    }

    return null;
}

function dropStoredObject() {
    var storedSeg = sessionStorage.getItem("errDropSeg");
    var storedNode = sessionStorage.getItem("errDropNode");

    dropObject(storedSeg,storedNode);
}

function expandNode(node) {

    reduceAllNodes();
    
    node.className = "expanded node unsort";
//    node.innerHTML = "";
    node.onclick = function () {
	reduceNode(node);
    };

//    var insideElement = document.createElement("div");
//    insideElement.className = "eventblock";
//    node.appendChild(insideElement);
    
    var nodeID = node.id.replace("sortnode","");
    nodeID = nodeID.replace("un","");
    var selectedNode = globalNodes[nodeID];

//    for (var i = 0; i < selectedNode.eventList.length; i++) {
//	var newText = document.createElement("div");
//	newText.innerHTML = "<p>" + selectedNode.eventList[i] + "<p>";
//	insideElement.appendChild(newText);
//    }

    badTimeline(selectedNode);    

}

function badTimeline(selectedNode) {    
    var presentIdx = null;
    
    for (var i = 0; i < timeline.length; i++) {
	if (timeline[i].eventList.includes("Present")) {
	    presentIdx = i;
	}
    }

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

function reduceAllNodes() {
    var expandedNodes = document.getElementsByClassName("expanded node");

    if (expandedNodes.length === 0) {
	return null;
    }

    reduceNode(expandedNodes[0]);
}

function reduceNode(node) {
    node.className = node.className.replace("expanded","reduced");
    node.onclick = function () {
	expandNode(node);
    };

//    var nodeID = node.id.replace("sortnode","");
//    nodeID = nodeID.replace("un","");
//    var selectedNode = globalNodes[nodeID];
//    node.innerHTML = "<p>" + selectedNode.eventList[0] + "</p>";

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

function expandBucket(bucketName) {    
    var pbElement = document.getElementById("pastbucket");
    var fbElement = document.getElementById("futurebucket");
    
    pbElement.remove();
    fbElement.remove();

    var textBox = document.getElementById("textbox");
    var storeText = textBox.innerHTML;
    textBox.remove();
    
    var bucketRow = document.getElementById("bucketrow");
    bucketRow.style.gridTemplateColumns = "800px 400px";

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

    var newTextBox = document.createElement("div");
    newTextBox.id = "textbox";
    newTextBox.innerHTML = storeText;
    bucketRow.appendChild(newTextBox);

}

function reduceBucket(bucketElement) {
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

function nodeToBucket(node,bucketElement) {
    var nodeBlock = bucketElement.getElementsByClassName("nodeblock")[0];

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

function loadBuckets() {
    
    var pbElement = document.getElementById("pastbucket");
    var pbNodes = pbElement.getElementsByClassName("node");

    var statList = [];
    for (var i = 0; i < pbNodes.length; i++) {
	statList.push(pbNodes[i]);
    }

    for (var i = 0; i < statList.length; i++) {
	var pbNode = statList[i];
	pbNode.remove();
    }

    var shortPB;
    if (pastBucket.length <= 3) {
	shortPB = pastBucket;
    } else {
	shortPB = pastBucket.slice(0,3);
    }
    
    shortPB.forEach(function(value) {
	nodeToBucket(value,pbElement);
    });

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
    
    var statList2 = [];
    for (var i = 0; i < fbNodes.length; i++) {
	statList2.push(fbNodes[i]);
    }

    for (var i = 0; i < statList2.length; i++) {
	var fbNode = statList2[i];
	fbNode.remove();
    }
    
    var shortFB;
    if (futureBucket.length <= 3) {
	shortFB = futureBucket;
    } else {
	shortFB = futureBucket.slice(0,3);
    }
    
    shortFB.forEach(function(value) {
	nodeToBucket(value,fbElement);
    });

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

function toInstructions() {

    sessionStorage.setItem("globalNodes",JSON.stringify(globalNodes));
    sessionStorage.setItem("timeline",JSON.stringify(timeline));
    sessionStorage.setItem("pastBucket",JSON.stringify(pastBucket));
    sessionStorage.setItem("futureBucket",JSON.stringify(futureBucket));

    var textBox = document.getElementById("textbox");
    sessionStorage.setItem("savedText",textBox.innerHTML);

}

function initializePage() {

    //var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    //if (isMobile) {
//	document.body.innerHTML = "<h2>THIS TOOL IS ONLY USABLE THROUGH A DESKTOP BROWSER. PLEASE SWITCH TO DESKTOP.</h2>";
//	return null;
    //    }

    window.onresize = function () {
	resizePage();
    }

    if (sessionStorage.getItem("globalNodes") === null) {
	pastBucket = [];
	futureBucket = [];

	var finalCount;

	var spanList = document.getElementsByTagName("span");
	
	for (var i = 0; i < spanList.length; i++) {
	    
	    var eventName = spanList[i].innerHTML;
	    var spanBucket;

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

	var presentEvent = new SortedNode("Present",finalCount);
	globalNodes.push(presentEvent);
	timeline = [presentEvent];
    	
    } else {
	globalNodes = JSON.parse(sessionStorage.getItem("globalNodes"));
	timeline = JSON.parse(sessionStorage.getItem("timeline"));
	pastBucket = JSON.parse(sessionStorage.getItem("pastBucket"));
	futureBucket = JSON.parse(sessionStorage.getItem("futureBucket"));
	savedText = sessionStorage.getItem("savedText");

	var textBox = document.getElementById("textbox");
	textBox.innerHTML = savedText;
	
    }

    refreshTimeline();
    loadBuckets();
    
}
