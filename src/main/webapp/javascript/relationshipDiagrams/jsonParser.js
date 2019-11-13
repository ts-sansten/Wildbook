class JSONParser {
    constructor() {
	this.graphId = 0;//id that will increment with each relevant MARKEDINDIVIDUAL
	this.nodeMap = {};//map of the MARKEDINDIVIDUALS to be displayed on the graph
	this.dataDict = {};//maps individualID to the rest of the individual's data
	this.relevantId = 0;//only one of these id's is needed, will change later
    }
    
    //Creates a relational object from JSON data
    parseJSON(iId, json) {
	this.getNodeRefs(json, () => this.parseJSONCallback(iId, json));
    }

    parseJSONCallback(iId, json) {
	this.nodes = this.parseNodes(iId, json);
	this.links = this.parseLinks(json);
    }
    
    parseNodes(iId, json) {
	console.log("iId", JSON.stringify(iId));
	
	var rId = this.getRelevantId();//numerical id that increments
	this.addNodeMapId(iId, rId);

	//right now if there are relationships with duplicates they will overwrite in the dict
	for(var i = 0; i < json.length; i++){
	    let nameOne = json[i].markedIndividualName1;
	    let nameTwo = json[i].markedIndividualName2;
	    let relevantId = this.getRelevantId();
	    if(nameOne != iId && nameTwo == iId){
		this.addNodeMapId(nameOne, relevantId); 
	    }
	    else if(nameTwo != iId && nameOne == iId){
		this.addNodeMapId(nameTwo, relevantId);
	    }
	}

	//testing the nodeMap and the dataDict
	console.log("here is the completed node map");
	console.log(this.nodeMap);
	console.log(this.dataDict);
	if(!this.dataDict[iId]){
	    console.log("this.dataDict[iId] is undefined");
	}
	console.log(this.dataDict[iId].displayName);
	
	/*json.map(entry => {
	    let tempId = entry.MarkedIndividualName1;
	    if(entry.markedIndividualName1 == iId){
		tempId = entry.MarkedIndividualName2
	    }
	    console.log("we are mapping the return");
	    return {
		"id": this.nodeMap[iId],
		//"group": //Not in use currently
		"data": {
		    "name": this.dataDict[tempId].displayName,
		    "gender": this.dataDict[tempId].sex,
		    "genus": this.dataDict[tempId].genus
		    
		}
	    }
	    });*/
	var nodes = new Array();
	
	for(let key in this.nodeMap){
	    console.log(key);
	    nodes.push({"id": this.nodeMap[key], "data": {"name": this.dataDict[key].displayName, "gender": this.dataDict[key].sex, "genus": this.dataDict[key].genus}});
	}
	    
	console.log(nodes);
	
	return nodes;
    }

    //TODO:  query for all markedindivudial data and create a dictionary with the ids
    getNodeRefs(json, callback) {
	let query = wildbookGlobals.baseUrl + "/api/jdoql?" +
	    encodeURIComponent("SELECT FROM org.ecocean.MarkedIndividual");//get all individuals
	    d3.json(query, (error, json) => this.createNodeDictionary(json, callback));
    }

    //creates the dictionary
    //TODO: remove debugging stuff
    createNodeDictionary(json, callback) {
	var sizeOfJSON = json.length;//number of MARKEDINDIVIDUALS
	
	if(sizeOfJSON >= 1){//if there is anything in the query result
	    console.log(json);
	    for (var i = 0; i < sizeOfJSON; i++) {//iterate over all MARKEDINDIVIDUALS
		console.log("inside the loop that creates the dict");
		this.dataDict[json[i].individualID] = json[i];//adding to dictionary of data referencable by individualID
	    }
	}
	else{
	    console.log("there is no json data");//if there is nothing in the array
	}
	
	//printing contents of dictionaries for testing
	console.log(this.dataDict);

	//Return to main
	callback();
    }

    getGraphId() {
	return this.graphId++;
    }

    getRelevantId() {
	return this.relevantId++;
    }

    getGender(id){
	return this.dataDict[this.nodeMap[id]].sex;
    }
    
    getGenus(id){
	return this.dataDict[this.nodeMap[id]].genus;
    }

    getDisplayName(id){
	return this.dataDict[this.nodeMap[id]].displayName;
    }

    addNodeMapId(nodeRef, id) {
	this.nodeMap[nodeRef] = id;
    }

    getNodeMapId(nodeRef) {
	return this.nodeMap[nodeRef];
    }

    addDataDictId(individualID, individualData){
	this.dataDict[individualID] = individualData;
    }
    
    getDataDictId(individualID){
	return this.dataDict[individualID];
    }

    getRelationType(entry){
	return this.dataDict[entry].type;
    }
    
    parseLinks(json) {
	return json
	    .filter(entry => {
		console.log(entry);
		let srcRef = entry.markedIndividualName1;
		let targetRef = entry.markedIndividualName2;
		console.log(srcRef);
		return this.getNodeMapId(srcRef) &&
		    this.getNodeMapId(targetRef);
	    })
	    .map(entry => {
		let srcRef = entry.markedIndividualName1;
		let targetRef = entry.markedIndividualName2;
		
		return {
		    "source": this.getNodeMapId(srcRef),
		    "target": this.getNodeMapId(targetRef),
		    "type": this.getRelationType(entry)
		}
	    });
    }

    
}//end
