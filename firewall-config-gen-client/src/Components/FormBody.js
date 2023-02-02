import './FormBody.css';
import CreateInput from './InputField';
import CreateContainer from './Container';
import React from 'react';
import ContainerTypes from '../ContainerTypes.js'
// use multiple dots to go back further levels ./ for one, ../ for two

const minimum = 4
const maximum = 15
var lastHoveredElement;

const errMsgs = {
    ipv4: "Must be a valid IP Address",
    text: "Must contain only alphanumeric characters, -, _ and be between " + minimum + " - " + maximum + " characters long with no spaces",
    vID: "Must be between or equal to 2 and 4095",
    portNo: "Must be between or equal to 1 and 65353",
}

const regex = {
    ipv4: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    text: /^[a-zA-Z0-9_-]{4,15}$/,
    password: /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{4,15}$/g,
    vlanId: /^[2-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-4][0][0-9][0-4]$/,
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
            fields: ["FirewallDefaults", "Hello"],
            // when someone adds a new subtype, this should handle what ID they are
            incrementID: 0,
            vlanIncrement: 0,

        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.addContainer = this.addContainer.bind(this);
        this.updateHover = this.updateHover.bind(this);
    }

  

    validateElement(element){
        // first, find the validation type of that element
        // to do this, we need to find the Container
        // with how things are set out, needs to be the grandparent (element stored in label, stored in div, stored in container)
        const Container = element.parentElement.parentElement.parentElement

        const validationType = ContainerTypes[Container.id][element.id].Validation
        var match = true
        const regexUsed = regex[validationType]
        const label = element.parentElement;
        console.log(label)
        
        const spanElement = label.getElementsByTagName('span')[0]
        console.log(label.childNodes)
        console.log(spanElement)

        if (regexUsed){
            if (!regexUsed.test(element.value)){
                match = false
            }
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
    }


    // This re-renders the DOM with a new item inside of the 'fields' array
    // Each item in the fields array is checked against the Containers array
    // If it's found in the containers array, all the elements from that object
    // are loaded inside of a new container

    addContainer(containerType){
        var increment = IncrementMapping[containerType]
        const newID = this.state[increment] + 1
        const newfields = this.state.fields.concat(containerType)

        this.setState({
            fields: newfields,
            [increment]: newID,
        })

    }

    removeContainer(event){
        if (lastHoveredElement.id != "FirewallDefaults"){
            // probably save the names in the table too
        }
    }

    updateHover(event){
        console.log("ran")
        const container = event.target;
        if ( ContainerTypes[container.id]){
            lastHoveredElement = container;
        }
        else if (ContainerTypes[container.parentElement.parentElement.parentElement.id]){
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
        const target = event.target;

        this.validateElement(target)

        /*
        const name = target.name;

        var newFormData = this.state.formData;
        newFormData[name] = target.value

        console.log("Updating")
        this.setState({
            formData: newFormData,
        })

        //console.log (this.state.formData);
        */
    }

    handleSubmit(event){
        event.preventDefault();
        var ableToSubmit = this.validateAll();

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
        // Need to work out how to map inside of those arrays
        // need to work out how to pass 'this' through multiple thoughs

    render(){
        const handleChangeEvent = this.handleChange
        const addContainer = this.addContainer
        const updateData = this.updateData
        const updateHover = this.updateHover
        var optionsCounter = 0;
        var vlanCounter = 0;
        var PFCounter = 0;

        return(
            <form onSubmit={this.handleSubmit}>
                { 
                    this.state.fields.map((item)=>{
                        // if the field exists in the container type, render it
                        if (ContainerTypes[item]) {
                            var containerID = item
                            var itemIncrement = IncrementMapping[item]
                            if (itemIncrement) {
                                itemIncrement = this.state[IncrementMapping[item]]

                                if (item === "FirewallOptions"){
                                    if (optionsCounter < itemIncrement){
                                        optionsCounter++;
                                    }
                                }
                                else if (item === "VLANInformation"){
                                    if (vlanCounter < itemIncrement){
                                        vlanCounter++
                                    }
                                }
                            }

                            var containerName = "";
                            return (
                                <CreateContainer containerID = {containerID} onMouseEnter={updateHover}>
                                    {
                                        
                                        // for each object in the field, create an input
                                        Object.keys(ContainerTypes[item]).map(function(keyname, keyindex){
                                            // if it's the name property, assign it to the header (with any relevant concatenation)
                                            if (!ContainerTypes[item][keyname].Name){
                                                
                                                var itemIncrement = IncrementMapping[item]
                                                if (itemIncrement) {
                                                    containerName = ContainerTypes[item][keyname] + " No. " + vlanCounter

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
                                                    itemName = ContainerTypes[item][keyname].Name + " " + vlanCounter;
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
                                                    return(
                                                        <CreateInput
                                                        id = {ContainerTypes[item][keyname].ID}
                                                        name = {itemName}
                                                        type = {ContainerTypes[item][keyname].InputType}
                                                        onBlur={handleChangeEvent}
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
                <button type ='button' onClick={()=> addContainer("VLANInformation")}> Remove me! </button>
                <button type = 'submit'> Submit </button>
            </form>
        )
    }
}

export default FireWallDetailsForm