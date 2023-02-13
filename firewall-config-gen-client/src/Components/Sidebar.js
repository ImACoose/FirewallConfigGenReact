import './sidebar.css'

function Sidebar({positionleft, positiontop, children}){
    console.log(positionleft)
    const actualLeft = (650 + positionleft)
    return(
        <div className='sidebar'
        style={{top:positiontop, left:actualLeft, transition: '0.3s'}}>
            {children}
            <button type = "button"><img src='/Images/add.png'/> </button>
        </div>
    )
}

export default Sidebar