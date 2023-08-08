/*
const OBJ_NONE = 0;
const OBJ_DOOR_EXT = 1;
const OBJ_WINDOW = 2;
const OBJ_DOOR_INT = 3;
const OBJ_STAIRS = 4;
*/

const WallSection = (props) => {    
    const pos = [
        (props.data.x * 4),
        0,
        props.data.y * 4
    ];

    const rot = [0,0,0];

    if (props.data.v === 1) {
        rot[1] = (props.data.v ? Math.PI/2 : 0);
        pos[2] += 2;
    } else {
        pos[0] += 2;
    }

    return (
    <group
        position={pos}
        rotation={rot}
    >
        <mesh 
            geometry={props.geo}
            material={props.mat}
        />
    </group>);
}

export default WallSection;