import './FormBody.css';
import CreateInput from './InputField';
import CreateContainer from './Container';
import React from 'react';
import ContainerTypes from '../ContainerTypes.js'

// use multiple dots to go back further levels ./ for one, ../ for two

const minimum = 4
const maximum = 15
const numberRegex = /\d+/g;
var lastHoveredElement;

const errMsgs = {
    ipv4: "Must be a valid IP Address",
    text: "Must contain only alphanumeric characters, -, _ and be between " + minimum + " - " + maximum + " characters long with no spaces",
    vlanId: "Must be between or equal to 2 and 4095",
    portNo: "Must be between or equal to 1 and 65353",
    password: "Must be between 4 - 15 characters",
    suffix: "Must be a valid address",
    bps: "Must be between or equal to 1000 and 1000000"
}

const regex = {
    ipv4: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    text: /^[a-zA-Z0-9_-]{4,15}$/,
    password: /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{4,15}$/g,
    //vlanId: /^[2-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-4][0][0-9][0-4]$/,
    suffix: /\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/g,
}

const IncrementMapping = {
    FirewallOptions: "incrementID",
    VLANInformation: "vlanIncrement",
}


// the form
class FireWallDetailsForm extends React.Component{
    constructor(props){
        super(props)

        var NewData = {}
        NewData["FirewallDefaults"] = {}

        Object.keys(ContainerTypes.FirewallDefaults).map(function(keyname, keyindex){
            if (ContainerTypes.FirewallDefaults[keyname].Name){
                if (ContainerTypes.FirewallDefaults[keyname].InputType == "text"){
                    NewData["FirewallDefaults"][keyname] = "";
                }
                else if (ContainerTypes.FirewallDefaults[keyname].InputType == "checkbox"){
                    NewData["FirewallDefaults"][keyname]= true
                }
                else if (ContainerTypes.FirewallDefaults[keyname].InputType == "checkboxGroup"){
                    NewData["FirewallDefaults"][keyname]= {}
                    console.log(ContainerTypes.FirewallDefaults[keyname].InputType)
                    
                    const checkboxArray = ContainerTypes.FirewallDefaults[keyname].checkboxArray

                    checkboxArray.forEach(element => {
                        console.log(element)
                        NewData["FirewallDefaults"][keyname][element] = false
                    });
                }
                else if (ContainerTypes.FirewallDefaults[keyname].InputType == "select"){
                    NewData["FirewallDefaults"][keyname] = ContainerTypes.FirewallDefaults[keyname].SelectOptions[0];
                }
            }
        })

  

        this.state = {
            formData: NewData,
            /*
            formData: {
                FirewallDefaults: [
                    hostname: 'abcd'
                    Admin Username: 'brycey'
                ]
            */
            // curly = object, square = array
            // when someone adds a new subtype, this should handle what ID they are
            incrementID: 0,
            vlanIncrement: 0,
            pfIncremenet: 0,
        }

        console.log(this.state.formData)

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.addContainer = this.addContainer.bind(this);
        this.updateHover = this.updateHover.bind(this);
    }

    validateRange(element, minimum, maximum){
        var match = true
        if (element.value <= maximum && element.value >= minimum){
            match = true
        }
        else{
            match = false
        }
        return match
    }

    validateElement(element){
        
        // first, find the validation type of that element
        // to do this, we need to find the Container
        // with how things are set out, needs to be the grandparent (element stored in label, stored in div, stored in container)
        const Container = element.parentElement.parentElement.parentElement
        const ContainerName = Container.id.replace(/\d+/g, '');


        const validationType = ContainerTypes[ContainerName][element.id].Validation
        var match = true
        const regexUsed = regex[validationType]
        const label = element.parentElement;
        
        const spanElement = label.getElementsByTagName('span')[0]
        if (regexUsed){
            if (!regexUsed.test(element.value)){
                match = false
            }
        }
        else if (validationType == "vlanId"){
            match = this.validateRange(element, 2, 4095)
        }
        else if (validationType == "portNo"){
            match = this.validateRange(element, 1, 65353)
        }
        else if (validationType == "bps"){
            match = this.validateRange(element, 1000, 1000000)
            console.log(match)
        }

        if (match == false){
            element.classList.add('error');

            spanElement.classList.remove('hide')
            spanElement.innerHTML = errMsgs[validationType]
        }
        else{
            element.classList.remove('error')
            spanElement.classList.add('hide')
        }
        console.log(element.classList)
        return match;
    }


    // This re-renders the DOM with a new item inside of the 'fields' array
    // Each item in the fields array is checked against the Containers array
    // If it's found in the containers array, all the elements from that object
    // are loaded inside of a new container

    addContainer(containerType){
        const oldSaved = this.state.formData
        var newSaved = oldSaved

        var increment = IncrementMapping[containerType]
        const newID = this.state[increment] + 1
        const containerID = containerType + newID

        newSaved[containerID] = {}

        console.log(containerID)
        console.log(containerType)

        Object.keys(ContainerTypes[containerType]).map(function(keyname, keyindex){
            console.log(ContainerTypes[containerType][keyname])
            if (ContainerTypes[containerType][keyname].Name){
                if (ContainerTypes[containerType][keyname].InputType == "text"){
                    newSaved[containerID][keyname] = "";
                }
                else if (ContainerTypes[containerType][keyname].InputType == "checkbox"){
                    newSaved[containerID][keyname] = true
                }
                else if (ContainerTypes[containerType][keyname].InputType == "checkboxGroup"){
                    console.log(ContainerTypes[containerType][keyname].InputType)
                    newSaved[containerID[keyname]] = {}
                 
                    const checkboxArray = ContainerTypes[containerType][keyname].checkboxArray

                    checkboxArray.forEach(element => {
                        console.log(element)
                        newSaved[containerID][keyname][element] = false
                    });
                }
                else if (ContainerTypes[containerType][keyname].InputType == "select"){
                    newSaved[containerID][keyname] = ContainerTypes[containerType][keyname].SelectOptions[0];
                }
            }
        })

        this.setState({
            formData: newSaved,
            [increment]: newID,
        })

        console.log(this.state.formData)

    }

    removeContainer(event){
        if (lastHoveredElement.id != "FirewallDefaults"){
            // probably save the names in the table too
            // need to grab all the optionals
            const baseID = lastHoveredElement.id.replace(numberRegex, '')
            if (baseID == "VLANInformation"){
                // grab it from the formData table

                const oldTable = this.state.formData
                //var index = oldTable.indexOf(lastHoveredElement.id) -- doesn't work with object
                var increment = IncrementMapping[baseID]
                const containerNumber = lastHoveredElement.id.match(numberRegex)
                var newIncrement = this.state[increment]

                if (containerNumber == newIncrement){
                    newIncrement = this.state[increment] -1
                }

                var newTable = oldTable
                delete(newTable[lastHoveredElement.id])

                this.setState({
                    formData: newTable,
                    [increment]: newIncrement,
                })
            }

        }
    }

    updateHover(event){
        const container = event.target;
        const numberRegex = /\d+/g;
        const baseID = container.id.replace(numberRegex, '');
        const parentID = container.parentElement.id.replace(numberRegex, '')
        const gGGrandparentID = container.parentElement.parentElement.parentElement.id.replace(numberRegex, '')


        if ( ContainerTypes[baseID]){
            lastHoveredElement = container;
        }
        else if (ContainerTypes[parentID]){
            lastHoveredElement = container.parentElement;
        }
        else if (ContainerTypes[gGGrandparentID]){
            lastHoveredElement = container.parentElement.parentElement.parentElement;
        }
    }

    validateAll(){
        var ableToSubmit = true
        // find way to grab all elements currently in DOM
        const inputElements = document.body.getElementsByTagName("input")


        for (var i = 0; i < inputElements.length; i++){
            if (inputElements[i].id != "reader" && inputElements[i].type != "checkbox") {
                var match = this.validateElement(inputElements[i])
                if (match == false){
                    ableToSubmit = false
                }
            }
        }
        // validate each one, find them in the containerTypes
        // mark error, return whether able to submit
        return ableToSubmit
    }

    // so far, elements are only saved through onBlurring 
    // need to save them upon validation and hitting submit
    handleChange = (event) => {
        const FormData = this.state.formData;

        const target = event.target;
        const gggParent = target.parentElement.parentElement.parentElement
        var NewData = FormData

        if (target.type == "checkbox"){
            //check whether it's part of a group, or standalone
            const parent = target.parentElement.parentElement //get the div, they're all inside of labels
            if (parent.classList[0] =="checkboxGroup"){
                NewData[gggParent.id][parent.id][target.id] = target.checked
            }
            else{
                NewData[gggParent.id][target.id] = target.checked
            }
     
        }        
        else if (target.type == "select"){

        }
        else{
            NewData[gggParent.id][target.id] = target.value
        }

        this.setState({formData: NewData})
    }

    handleBlur = (event) => {
        const FormData = this.state.formData;

        const target = event.target;
        const gggParent = target.parentElement.parentElement.parentElement
        var NewData = FormData
        NewData[gggParent.id][target.id] = target.value
        if (target.type !== "select"){
            this.validateElement(target)
        }

        this.setState({formData: NewData})
    }


    handleSubmit(event){
        console.log(this.state.formData)
        event.preventDefault();
        var ableToSubmit = this.validateAll();
        ableToSubmit = true

        if (ableToSubmit == true){
            // send  a request to this specific URL
            fetch('http://localhost:3001/generate', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                // correct way to use
                body: JSON.stringify(this.state.formData)
            }).then((response) => response.json()) 
            .then((result)=>{
                console.log(result)
            })

            console.log(`The data has been submitted`);

        }
        else {
            console.log("not able to submit")
        }

    }

    ExportData = (e) => {
        e.preventDefault();
        const element = document.createElement("a");
        const DataToExport = this.state.formData

        var newString = ""; // this will be what is exported to a text file
        const entries = Object.entries(DataToExport)

        // for each container in the form
        for (let i = 0; i < entries.length; i++){
            console.log(entries[i])
            const container = entries[i]
            const containerName = container[0]
            const containerFields = container[1]

            //concat a new container field
            newString = newString.concat("", containerName, "=", "{")

            // this sorts it into containers and their fields
            const keyValues = Object.entries(containerFields)

            // then concat all the fields inside
            for (let j = 0; j < keyValues.length; j++){
                const objID = keyValues[j][0]
                const objValue = keyValues[j][1]
                newString = newString.concat(objID, ":", objValue)

                // if it's at the end, close off the bracket, else, insert a comma
                if (j + 1 == keyValues.length){
                    newString = newString.concat("}")
                }
                else{
                    newString = newString.concat(",")
                }
            }

            if (i + 1 != entries.length){
                newString = newString.concat(";")
            }
        }
        // create a new file, using the newString as the value to export. by default, this is set to import in that same format
        const file = new Blob([newString], {type:'text/plain'})
        element.href = URL.createObjectURL(file);
        element.download = "FirewallConfig.txt";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }

    // imports configs from a text file -- hasn't been validated properly yet
    ImportData = (e) => {
        e.preventDefault();
        const reader = new FileReader()
        var containers = {};

        reader.onload = (e) => {
            const text = e.target.result
            console.log(text)
            const sections = text.split(';')
            console.log(sections)
            
            for (let i = 0; i < sections.length; i++){
                const HeaderAndValues = sections[i].split('=');
                console.log(HeaderAndValues);
                const containerName = HeaderAndValues[0]
                containers[containerName] = {};

                const keyvalues = HeaderAndValues[1].split(',');

                for (let j = 0; j < keyvalues.length; j++){
                    const IDandValue = keyvalues[j].split(':');
                    const ID = IDandValue[0].replace('{', '')
                    const val = IDandValue[1].replace('}', '')
                    containers[containerName][ID] = val
                }
            }

            console.log(containers)

            this.setState({
                formData: containers
            })

        }
        reader.readAsText(e.target.files[0])

        // read from a text file
        // seperate entries by a delimiter (probably a colon, maybe a comma)
        // update the state based on these values
        // check object titles, such as VLAN, FirewallDefaults etc and sort by those first

    }

    
        // Need to work out how to map inside of those arrays
        // need to work out how to pass 'this' through multiple thoughs

    render(){
        const handleChangeEvent = this.handleChange
        const addContainer = this.addContainer
        const updateHover = this.updateHover
        const handleBlur = this.handleBlur
        const formData = this.state.formData

        console.log(this.state.formData)

        return(
            <form onSubmit={this.handleSubmit}>
                { 
                    Object.keys(this.state.formData).map((ID)=>{
                        // if the field exists in the container type, render it
                        const item = ID.replace(numberRegex, '')

                        if (ContainerTypes[item]) {
                            var containerID = ID
                            var Numbers = containerID.match(numberRegex)
                            var containerName = "";
                            const newClass = "Container " + item
                            return (
                                <CreateContainer containerID = {containerID} className = {newClass} onMouseEnter={updateHover}>
                                    {
                                        
                                        // for each object in the field, create an input
                                        Object.keys(ContainerTypes[item]).map(function(keyname, keyindex){
                                          
                                            // if it's the name property, assign it to the header (with any relevant concatenation)
                                            if (!ContainerTypes[item][keyname].Name){
                                                
                                                var itemIncrement = IncrementMapping[item]
                                                if (itemIncrement) {
                                                    containerName = ContainerTypes[item][keyname] + " " + Numbers[0]
                                                }
                                                else{
                                                    containerName = ContainerTypes[item][keyname]
                                                }

                                                return(
                                                    <h1> {containerName}</h1>
                                                );  
                                            }
                                            else{
                                                // sort out the naming scheme here, used for indexing on the back end, so very important
                                                var itemName = "";
                                                if (containerName !== "System Settings"){
                                                    itemName = ContainerTypes[item][keyname].Name + " " + Numbers[0]
                                                }
                                                else{
                                                    itemName = ContainerTypes[item][keyname].Name 
                                                }
                                                
                                                // select is handled differently from other input
                                                if (ContainerTypes[item][keyname].InputType === "select"){
                                                    return(
                                                        <CreateInput
                                                        id = {ContainerTypes[item][keyname].ID}
                                                        name = {itemName}
                                                        type = {ContainerTypes[item][keyname].InputType}
                                                        onBlur={handleChangeEvent}
                                                        SelectOptions = {ContainerTypes[item][keyname].SelectOptions}
                                                        >
                                                        </CreateInput>
                                                    )
                                                }
                                                else if(ContainerTypes[item][keyname].InputType === "checkboxGroup"){
                                                    //checks whether there's a value to import
                                                    const otherID = ContainerTypes[item][keyname].ID;
                                                    return(
                                                        <CreateInput
                                                        id = {ContainerTypes[item][keyname].ID}
                                                        name = {itemName}
                                                        type = {ContainerTypes[item][keyname].InputType}
                                                        onBlur={handleBlur}
                                                        onChange={handleChangeEvent}
                                                        checkboxArray = {ContainerTypes[item][keyname].checkboxArray}
                                                        >
                                                        </CreateInput>
                                                    )
                                                }
                                                else{
                                                    //checks whether there's a value to import
                                                    const otherID = ContainerTypes[item][keyname].ID;

                                                    return(
                                                        <CreateInput
                                                        id = {ContainerTypes[item][keyname].ID}
                                                        name = {itemName}
                                                        type = {ContainerTypes[item][keyname].InputType}
                                                        onBlur={handleBlur}
                                                        onChange={handleChangeEvent}
                                                        importedValue = {formData[ID][otherID]}
                                                        >
                                                        </CreateInput>
                                                    )
                                                }

                                            }
                                           
                                        })
                                    }
                                </CreateContainer>
                            )

                        }     
                    })
                }
                <button type ='button' onClick={()=> addContainer("VLANInformation")}> Click me! </button>
                {// need to declare type = button, otherwise it will act as a submit button
                }
                <button type ='button' onClick={()=> this.removeContainer()}> Remove me! </button>
                <button type = 'button' onClick={this.ExportData}> Export! </button>
                <CreateInput
                type="reader"
                onChange={this.ImportData}>
                </CreateInput>
        
                <button type = 'submit'> Submit </button>
            </form>
        )
    }
}

export default FireWallDetailsForm