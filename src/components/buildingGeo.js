import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import { useGLTF } from '@react-three/drei'

import "../App.css";

import Ground from "./ground";
import BuildingFloor from "./buildingFloor";

const BuildingGeo = (props) => {
    const { nodes, materials } = useGLTF('/assets/geo/buildingPartsWood.glb');
    console.log(nodes, materials);

    const wallMat = materials.WallMat;
    const floorMat = materials.FloorMat;
    const roofMat = materials.RoofMat;

    /*
    const OBJ_NONE = 0;
    const OBJ_DOOR_EXT = 1;
    const OBJ_WINDOW = 2;
    const OBJ_DOOR_INT = 3;
    const OBJ_STAIRS = 4;
    */

    const wallGeo = [
        nodes.wall_wood_full_.geometry,             // basic wall
        nodes.wall_wood_full_bigdoorway.geometry,   // exterior door
        nodes.wall_wood_big_window.geometry,        // window
        nodes.wall_wood_full_doorway.geometry       // interior door
    ];

    const floorGeo = [
        nodes.floor_wood_slab_.geometry,    // normal floor
        nodes.floor_wood_ramp_.geometry     // ramp
    ];

    const roofGeo = [
        nodes.floor_wood_slab_.geometry,    // flat roof
        nodes.roof_wood.geometry,           // angled roof
        nodes.roof_wood_corner_outer.geometry,  // corner (convex)
        nodes.roof_wood_corner_inner.geometry   // corner (concave)
    ];


    const build = props.building;
    
    const floors = build.floors.map((floorData, i) => {
        return (
            <BuildingFloor
                key={floorData.zPos}
                data={floorData}
                wallGeo={wallGeo}
                wallMat={wallMat}
                floorGeo={floorGeo}
                floorMat={floorMat}
                roofGeo={roofGeo}
                roofMat={roofMat}
            />);
    });

    const pos = [
        -(build.floors[0].w/2) * 4,
        0,
        -(build.floors[0].h/2) * 4
    ];

    return (
        <div id="layer-scene">
            <Suspense fallback={null}>
                <Canvas
                    camera={{position: [pos[0], 7.5, pos[2]]}}
                >
                <hemisphereLight />
                <directionalLight 
                    position={[20, 0, 20]}
                />
                <OrbitControls />
                <Sky />

                <Ground />

                <group
                    position={pos}
                >
                    {floors}
                </group>

                </Canvas>
            </Suspense>
    </div>);
}

export default BuildingGeo;