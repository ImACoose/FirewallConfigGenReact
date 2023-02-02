import './InputField.css'

function CreateInputField ({id, name, type, onBlur, SelectOptions}) {

    if (type == "select"){
        return (
            <div>
                <label> {name}: <select id={id} name={name} onBlur={onBlur}>
                    {SelectOptions.map(function(optionName, Index){
                        return <option key = {Index} name={optionName}>
                            {optionName}
                        </option>
                    })}
                </select></label>
            </div>
        )
    }
    else{
        return (
            <div className=''>
                <label> {name}: <input id={id} name={name} type={type} onBlur={onBlur}></input> <span className='hide err'> Err Msg </span> </label>
            </div>
        )
    }

}

export default CreateInputField