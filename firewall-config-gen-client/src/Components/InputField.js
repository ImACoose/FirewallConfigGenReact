import './InputField.css'

function CreateInputField ({id, name, type, onBlur, onChange, importedValue, SelectOptions, checkboxArray}) {

    if (type == "select"){
        return (
            <div>
                <label> {name}: <select id={id} name={name} onBlur={onBlur} onChange={onChange} value={importedValue}>
                    {SelectOptions.map(function(optionName, Index){
                        return <option key = {Index} name={optionName}>
                            {optionName}
                        </option>
                    })}
                </select></label>
            </div>
        )
    }
    else if (type == "reader"){
        return (
            <div>
                <input id = "reader" type = "file" onChange={onChange}/>
            </div>
        )
    }
    else if (type=="checkbox"){
        console.log(importe)
        return (
            <div>
                <label> {name}<input id = {id} type = "checkbox" onChange={onChange} checked={importedValue}/></label>
            </div>
        )
    }
    else if (type=="checkboxGroup"){
        const arrayOfFields = checkboxArray
        // id here is the id of the ENTIRE array

        return(
            <div>
                <label> {name} </label>
                <div className='checkboxGroup' id = {id}>
                {arrayOfFields.map(element => {
                    // element here will be ID of each item in the checkbox array
                    return(
                        <label>
                            {element}
                            <input id = {element} type = "checkbox" onChange={onChange} checked={importedValue[element]}/>
                        </label>
                    )
                })}
                </div>

            </div>
        )
    }
    else{
        console.log("The imported value is" + importedValue)
        return (
            <div className=''>
                <label> {name}: <input id={id} name={name} value={importedValue} type={type} onBlur={onBlur} onChange={onChange}></input> <span className='hide err'> Err Msg </span> </label>
            </div>
        )
    }

}

export default CreateInputField