const Ground = () => {
    return (<group>
        <mesh
            rotation={[-Math.PI/2, 0, 0]}
        >
            <planeBufferGeometry args={[300,300,1,1]} />
            <meshLambertMaterial color={"darkgreen"} />
        </mesh>
    </group>);
}

export default Ground;