const path = require('path');
const fs = require('fs').promises;

const satellites = (async () => {
    // Paths for ISS and Starlink TLE data
    const ISS_TLE_PATH = path.join(__dirname, '../data/stations.txt');
    const STARLINK_TLE_PATH = path.join(__dirname, '../data/starlink.txt');

    try {
        const satellitesTLEs = [];

        // Read TLE text data from local files
        const [stationsText, starlinkText] = await Promise.all([
            fs.readFile(ISS_TLE_PATH, 'utf-8'),
            fs.readFile(STARLINK_TLE_PATH, 'utf-8')
        ]);

        // Helper to parse a specific satellite's TLE from a text block by name
        function extractTLE(tleText, satName) {
            const lines = tleText.trim().split(/[\r\n]+/);
            const index = lines.findIndex(line => line.trim().startsWith(satName));
            if (index !== -1 && index + 2 < lines.length) {
                const tle1 = lines[index + 1].trim();
                const tle2 = lines[index + 2].trim();
                return { name: satName, tle1, tle2 };
            }
            return null;
        }

        // Extract ISS (ZARYA) TLE – ISS is identified by the name "ISS (ZARYA)"
        satellitesTLEs.push(extractTLE(stationsText, 'ISS (ZARYA)'));

        // Extract Starlink satellites TLE
        const starlinkLines = starlinkText.trim().split(/[\r\n]+/);
        for (let i = 0; i < /*starlinkLines.length*/ 4; i += 3) {
            if (i + 2 < starlinkLines.length) {
                const name = starlinkLines[i].trim();
                const tle1 = starlinkLines[i + 1].trim();
                const tle2 = starlinkLines[i + 2].trim();
                satellitesTLEs.push({ name, tle1, tle2 });
            }
        }

        // Return the TLE data 
        return satellitesTLEs;
    } catch (error) {
        console.error('Error reading TLE data:', error);
        return null;
    }
})();

module.exports = satellites;