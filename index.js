import Jimp from 'jimp';

let getRgbArray = async function (url: string): Promise<number[][]> {
    let rgbArray: number[][] = [];
    let image = await Jimp.read(url);
    image.resize(500, Jimp.AUTO);

    try {
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (_x, _y, idx) {
            // x, y is the position of this pixel on the image
            // idx is the position start position of this rgba tuple in the bitmap Buffer
            // this is the image
            let pixel: number[] = [];
            var red = this.bitmap.data[idx + 0];
            pixel.push(red);
            var green = this.bitmap.data[idx + 1];
            pixel.push(green);
            var blue = this.bitmap.data[idx + 2];
            pixel.push(blue);
            //var alpha = this.bitmap.data[idx + 3];

            rgbArray.push(pixel);

            // rgba values run from 0 - 255
            // e.g. this.bitmap.data[idx] = 0; // removes red from this pixel
        });
    } catch (error) {
        console.log(error);
    }
    return rgbArray;
};

const findBiggestColorRange = (rgbValues: number[][]) => {
    let rMin = Number.MAX_VALUE;
    let gMin = Number.MAX_VALUE;
    let bMin = Number.MAX_VALUE;

    let rMax = Number.MIN_VALUE;
    let gMax = Number.MIN_VALUE;
    let bMax = Number.MIN_VALUE;

    rgbValues.forEach((pixel) => {
        rMin = Math.min(rMin, pixel[0]);
        gMin = Math.min(gMin, pixel[1]);
        bMin = Math.min(bMin, pixel[2]);

        rMax = Math.max(rMax, pixel[0]);
        gMax = Math.max(gMax, pixel[1]);
        bMax = Math.max(bMax, pixel[2]);
    });

    const rRange = rMax - rMin;
    const gRange = gMax - gMin;
    const bRange = bMax - bMin;

    const biggestRange = Math.max(rRange, gRange, bRange);
    if (biggestRange === rRange) {
        return 0;
    } else if (biggestRange === gRange) {
        return 1;
    } else {
        return 2;
    }
};

const quantization = (rgbValues: number[][], depth: number): {}[] => {
    const MAX_DEPTH = 4;
    if (depth === MAX_DEPTH || rgbValues.length === 0) {
        const color = rgbValues.reduce(
            (prev, curr) => {
                prev[0] += curr[0];
                prev[1] += curr[1];
                prev[2] += curr[2];

                return prev;
            },
            [0, 0, 0]
        );

        color[0] = Math.round(color[0] / rgbValues.length);
        color[1] = Math.round(color[1] / rgbValues.length);
        color[2] = Math.round(color[2] / rgbValues.length);
        return [color];
    }
    const componentToSortBy = findBiggestColorRange(rgbValues);
    rgbValues.sort((p1, p2) => {
        return p1[componentToSortBy] - p2[componentToSortBy];
    });

    const mid = rgbValues.length / 2;
    return [...quantization(rgbValues.slice(0, mid), depth + 1), ...quantization(rgbValues.slice(mid + 1), depth + 1)];
};

let getPallet = async function (): Promise<number[][]> {
    let pallet: number[][] = [];
    let image = await getRgbArray('https://i.redd.it/e1c6fwi6rf1a1.jpg');
    let testPallet = quantization(image, 0);
    console.log(testPallet);

    try {
    } catch (error) {
        console.log(error);
    }
    return pallet;
};

export default getPallet;
