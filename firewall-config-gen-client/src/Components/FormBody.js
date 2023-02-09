import './FormBody.css';
import CreateInput from './InputField';
import CreateContainer from './Container';
import React from 'react';
import ContainerTypes from '../ContainerTypes.js'
// use multiple dots to go back further levels ./ for one, ../ for two

const minimum = 4
const maximum = 15
const numberRegex = /\d+/g;
var initialised = false;
var lastHoveredElement;

const errMsgs = {
    ipv4: "Must be a valid IP Address",
    text: "Must contain only alphanumeric characters, -, _ and be between " + minimum + " - " + maximum + " characters long with no spaces",
    vlanId: "Must be between or equal to 2 and 4095",
    portNo: "Must be between or equal to 1 and 65353",
    password: "Must be between 4 - 15 characters",
    suffix: "Must be a valid address",
    bps: "Must be between or equal to 5000000 and 1000000000"
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

        this.state = {
            formData: {},
            /*
            formData: {
                FirewallDefaults: [
                    hostname: 'abcd'
                    Admin Username: 'brycey'
                ]
z
                VlanInformation1: [
                    VlanID: 123,
                ]

                VlanInformation2: [

                ]

                PortForwarding1: [

                ]
            }
            
            
            
            
            */
            // curly = object, square = array
            // when someone adds a new subtype, this should handle what ID they are
            incrementID: 0,
            vlanIncrement: 0,
            pfIncremenet: 0,
        }

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
            match = this.validateRange(element, 5000000, 1000000000)
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

        Object.keys(ContainerTypes[containerType]).map(function(keyname, keyindex){
            if (ContainerTypes[containerType][keyname].Name){
                if (ContainerTypes[containerType][keyname].InputType == "text"){
                    newSaved[containerID][keyname] = "";
                }
                else if (ContainerTypes.FirewallDefaults[keyname].InputType == "select"){
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
                var newIncrement = this.state[increment] -1 

                var newTable = oldTable
                delete(newTable[lastHoveredElement.id])

                this.setState({
                    formData: newTable,
                    [increment]: newIncrement,
                })

                console.log(this.state.formData)
                
            }

        }
    }

    updateHover(event){
        console.log("ran")
        const container = event.target;
        console.log(event.target)
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
        console.log(lastHoveredElement.id)
    }

    validateAll(){
        var ableToSubmit = true
        // find way to grab all elements currently in DOM
        const inputElements = document.body.getElementsByTagName("input")
        const selectElements = document.body.getElementsByTagName("select")

        console.log(inputElements)

        for (var i = 0; i < inputElements.length; i++){
            var match = this.validateElement(inputElements[i])
            if (match == false){
                ableToSubmit = false
            }
        }
        // validate each one, find them in the containerTypes
        // mark error, return whether able to submit
        return ableToSubmit
    }

    updateData = (name, value) =>{
        var newFormData = this.state.formData;
        newFormData[name] = value

        this.setState({
            formData: newFormData,
        })

    }

    // so far, elements are only saved through onBlurring 
    // need to save them upon validation and hitting submit
    handleChange = (event) => {
        console.log("handling change")
        const FormData = this.state.formData;

        const target = event.target;
        const gggParent = target.parentElement.parentElement.parentElement
        var NewData = FormData
        NewData[gggParent.id][target.id] = target.value
        console.log(NewData[gggParent.id][target.id])


        this.setState({formData: NewData})
    }

    handleBlur = (event) => {
        console.log("handling blur")
        const FormData = this.state.formData;

        const target = event.target;
        const gggParent = target.parentElement.parentElement.parentElement
        var NewData = FormData
        NewData[gggParent.id][target.id] = target.value
        console.log(NewData[gggParent.id][target.id])

        if (target.type !== "select"){
            this.validateElement(target)
        }

        this.setState({formData: NewData})

        console.log(this.state.formData)
    }


    handleSubmit(event){
        console.log(this.state.formData)
        event.preventDefault();
        var ableToSubmit = this.validateAll();
        ableToSubmit = true

        if (ableToSubmit == true){
            // send  a request to this specific URL
            fetch('http://localhost:3001/express_server', {
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

    InitFormData(){
        var NewData = {}
        NewData["FirewallDefaults"] = {}

        Object.keys(ContainerTypes.FirewallDefaults).map(function(keyname, keyindex){
            if (ContainerTypes.FirewallDefaults[keyname].Name){
                if (ContainerTypes.FirewallDefaults[keyname].InputType == "text"){
                    NewData["FirewallDefaults"][keyname] = "";
                }
                else if (ContainerTypes.FirewallDefaults[keyname].InputType == "select"){
                    NewData["FirewallDefaults"][keyname] = ContainerTypes.FirewallDefaults[keyname].SelectOptions[0];
                }
            }
        })

        this.setState({
            formData: NewData
        })

        console.log("DOne initilialising")
        initialised = true
        console.log(this.state.formData)
    }

    
        // Need to work out how to map inside of those arrays
        // need to work out how to pass 'this' through multiple thoughs

    render(){
        const handleChangeEvent = this.handleChange
        const addContainer = this.addContainer
        const updateData = this.updateData
        const updateHover = this.updateHover
        const handleBlur = this.handleBlur
        const formData = this.state.formData
        var baseContainers = this.state.savedOptionals
        console.log(baseContainers)

        console.log(this.state.formData)
        if (initialised === false){
            console.log("Initialising")
            this.InitFormData();
        }

        return(
            <form onSubmit={this.handleSubmit}>
                { 
                    Object.keys(this.state.formData).map((ID)=>{
                        // if the field exists in the container type, render it
                        const item = ID.replace(numberRegex, '')

                        if (ContainerTypes[item]) {
                            var containerID = ID
                            var Numbers = containerID.match(numberRegex)

                            if (Numbers) {
                                console.log(Numbers)
                            }

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
                                                else{
                                                    //checks whether there's a value to import
                                                    const otherID = ContainerTypes[item][keyname].ID;
                                                    var valueToImport = "";

                                                    console.log(ID)
                                                    console.log(otherID)
                                                    console.log(ContainerTypes[item][keyname])
                                                    console.log(formData[ID][otherID])

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
                <button type = 'submit'> Submit </button>
            </form>
        )
    }
}

export default FireWallDetailsForm