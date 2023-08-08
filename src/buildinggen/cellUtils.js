/**
 * Takes in an int characterizing the nature of things at a given cell based on the
 * 3x3 grid in which it sits. Currently just for roofs, but could be used for other things
 * 
 * Note that this list isn't yet exhaustive, but it covers what tends to crop up with the 
 * current generation system
 */
const getGeoAndRotation = (cellType) => {

    switch (cellType) {
        // slanted roof sections
        case 502:
        case 439:
        case 438:
            return [1, 0]
        case 319:
        case 127:
        case 63: 
            return [1, 1]
        case 223:
        case 475:
        case 219:
            return [1, 2]
        case 505:
        case 508:
        case 504:
            return [1, 3]

        // convex corners
        case 246:
        case 310:
        case 55:
        case 311:
        case 54:
            return [2, 0];
        case 315:
        case 31:
        case 91:
        case 95:
        case 27:
            return [2, 1];
        case 222:
        case 217:
        case 472:
        case 473:
        case 216:
            return [2, 2];
        case 441:
        case 496:
        case 436:
        case 500:
        case 432:
            return [2, 3];
        
        // concave corners
        case 447:
            return [3, 0];
        case 255:
            return [3, 1];
        case 507:
            return [3, 2];
        case 510:
            return [3, 3];

        default:
            return [0,0];
    }
}

export {
    getGeoAndRotation
}