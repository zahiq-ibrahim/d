
const sharp = require("sharp");

async function getDominantColor(imageUrl) {
    const response = await fetch(imageUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    const { data, info } = await sharp(imageBuffer)
        .resize(100, 100, { fit: "inside" })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const colorCounts = new Map();

    for (let i = 0; i < data.length; i += info.channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Group similar shades together.
        const qr = Math.min(255, Math.round(r / 16) * 16);
        const qg = Math.min(255, Math.round(g / 16) * 16);
        const qb = Math.min(255, Math.round(b / 16) * 16);

        const key = `${qr},${qg},${qb}`;

        colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
    }

    let dominantColor = "";
    let maxCount = 0;

    for (const [color, count] of colorCounts) {
        if (count > maxCount) {
            dominantColor = color;
            maxCount = count;
        }
    }

    const [r, g, b] = dominantColor.split(",").map(Number);

    return "#" + [r, g, b]
        .map(value => value.toString(16).padStart(2, "0"))
        .join("");
}

module.exports = { getDominantColor };
