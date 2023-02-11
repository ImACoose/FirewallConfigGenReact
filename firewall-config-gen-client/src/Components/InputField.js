import './InputField.css'

function CreateInputField ({id, name, type, onBlur, onChange, importedValue, SelectOptions, checkboxArray}) {

    if (type == "select"){
        return (
            <div>
                <label> {name}: <select id={id} name={name} onBlur={onBlur} onChange={onChange}>
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
        return (
            <div>
                <label> {name}<input id = {id} type = "checkbox" onChange={onChange}/></label>
            </div>
        )
    }
    else if (type=="checkboxGroup"){
        const arrayOfFields = checkboxArray
        return(
            <div className='checkboxGroup' id = {id}>
                {arrayOfFields.map(element => {
                    return(
                        <label>
                            {element}
                            <input id = {element} type = "checkbox" onChange={onChange} value={importedValue}/>
                        </label>
                    )
                })}
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