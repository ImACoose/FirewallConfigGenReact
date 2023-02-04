import './Container.css'

function CreateContainer({containerID, className, onMouseEnter, children}){
    console.log(containerID)

    return(
        <div id={containerID} className={className} onMouseEnter={onMouseEnter}>
            {children}
        </div>
    )
}

export default CreateContainer;