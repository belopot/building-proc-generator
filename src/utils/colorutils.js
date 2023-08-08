const randomColorLight = () => {
    const r = Math.floor(Math.random() * 127) + 127;
    const g = Math.floor(Math.random() * 127) + 127;
    const b = Math.floor(Math.random() * 127) + 127;
    return `rgb(${r}, ${g}, ${b})`;
}


export {
    randomColorLight
}