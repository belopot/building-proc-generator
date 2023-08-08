const RoofSection = (props) => {
    const rot = [0,0,0];
    rot[1] = Math.PI/2 * props.data.rot;
    
    const pos = [
        (props.data.x * 4),
        0,
        (props.data.y * 4)
    ];
    if (props.data.t === 511) {
        pos[1] = 3;
    }
    
    return (
        <group
            position={pos}
        >
            <group
                position={[2,0,2]}
                rotation={rot}
            >
                <mesh 
                    geometry={props.geo}
                    material={props.mat}
                />
            </group>
        </group>
    );

}

export default RoofSection;