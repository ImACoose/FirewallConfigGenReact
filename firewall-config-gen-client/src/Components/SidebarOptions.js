import './SidebarOptions.css'

function SidebarOptions({positionTop, positionLeft, width, visibility, children}){
    const actualLeft = (710 + positionLeft)
    console.log(visibility)
    return(
        <div className="SidebarOptions"
        style = {{top: positionTop, left: actualLeft, transition: '0.3s', width: width, visibility:visibility }}>
            {children}
        </div>
    )
}

export default SidebarOptions