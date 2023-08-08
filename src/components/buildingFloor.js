import WallSection from "./wallSection";
import FloorSection from "./floorSection";
import RoofSection from "./roofSection";

const BuildingFloor = (props) => {

    // const intIdxStart = props.data.walls.exterior.length;
    // const floorIdxStart = intIdxStart + props.data.walls.interior.length;

    /*
    const OBJ_NONE = 0;
    const OBJ_DOOR_EXT = 1;
    const OBJ_WINDOW = 2;
    const OBJ_DOOR_INT = 3;
    const OBJ_STAIRS = 4;
    */

    const wallsExt = props.data.walls.exterior.map((wall, i) => {
        
        return (
            <WallSection 
                data={wall}
                isExterior={true}
                key={i}
                geo={props.wallGeo[wall.obj]}
                mat={props.wallMat}
            />);
    });

    const wallsInt = props.data.walls.interior.map((wall, i) => {
        return (
            <WallSection 
                data={wall}
                isExterior={false}
                key={i}
                geo={props.wallGeo[wall.obj]}
                mat={props.wallMat}                
            />);
    });

    const floors = props.data.floors.map((floor, i) => {
        
        const geoIdx = floor.obj === 0 ? 0 : 1;
        
        return (
            <FloorSection
                data={floor}
                key={i}
                geo={props.floorGeo[geoIdx]}
                mat={props.floorMat}
            />
        )
    });

    const roofing = props.data.ceilings.map((tile, i) => {
        return (
            <RoofSection
                data={tile}
                key={i}
                geo={props.roofGeo[tile.geo]}
                mat={props.roofMat}
            />
        )
    });

/*


*/

    return (
        <group
            position={[0, props.data.zPos * 3, 0]}
        >
            <group>
                {wallsExt}
                {wallsInt}
                {floors}
            </group>

            { props.data.hasRoof && 
            <group
                position={[0, 3, 0]}
            >
                {roofing}
            </group>
            }

        </group>);
}

export default BuildingFloor;