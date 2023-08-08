import { useRef, useEffect, useState } from "react";
import "../App.css";

const Blueprint = (props) => {
    const canvasRef = useRef();
    const building = props.building;
    const [ currFloor, setFloor ] = useState(0);

    useEffect(() => {
        const canv = canvasRef.current;
        const ctx = canv.getContext('2d');
        ctx.clearRect(0, 0, 500, 500);        
        building.draw(ctx, currFloor);
    }, [currFloor, building]);

    return (<div id="layer-map">
        <div id="controls-floor">
            <button onClick={() => {
                setFloor(Math.max(0, currFloor-1));
            }}>{"<-"}</button>
            {currFloor+1} / {building.floors.length}
            <button onClick={() => {
                setFloor(Math.min(building.floors.length-1, currFloor+1));
            }}>{"->"}</button>
        </div>

        <canvas 
            id="stage"
            ref={canvasRef}
            width={500}
            height={500}>    
        </canvas>
    </div>)
}

export default Blueprint;