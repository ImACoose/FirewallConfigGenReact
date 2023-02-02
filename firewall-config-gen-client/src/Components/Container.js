import './Container.css'

function CreateContainer({containerID, onMouseEnter, children}){
    console.log(containerID)

    return(
        <div id={containerID} className='Container' onMouseEnter={onMouseEnter}>
            {children}
        </div>
    )
}

export default CreateContainer;