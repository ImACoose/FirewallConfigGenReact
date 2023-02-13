import './sidebar.css'

function Sidebar({positionleft, positiontop}){
    console.log(positionleft)
    const actualLeft = (650 + positionleft)
    return(
        <div className='sidebar'
        style={{top:positiontop, left:actualLeft, transition: '0.3s'}}>
            <button type = "button"> <img src='/Images/importsign.png'/></button>
            <button type = "button"> sidebar testing </button>
            <button type = "button"> sidebar testing </button>
        </div>
    )
}

export default Sidebar