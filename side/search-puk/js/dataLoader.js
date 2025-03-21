// Global object to store combined PUK data
let combinedPukData = {};
let loadedFiles = new Set();
let isLoading = false;
let scriptElements = new Map(); // Track script elements for cleanup

// Function to merge new data into the combined data
function mergePukData(newData, fileName) {
    combinedPukData = {
        ...combinedPukData,
        ...newData
    };
    if (fileName) {
        loadedFiles.add(fileName);
    }
}

// Function to get data for a specific MSISDN
function getPukData(msisdn) {
    return combinedPukData[msisdn] || null;
}

// Function to get all available data
function getAllPukData() {
    return combinedPukData;
}

// Function to remove script element after data is loaded
function cleanupScript(fileName) {
    const script = scriptElements.get(fileName);
    if (script && script.parentNode) {
        script.parentNode.removeChild(script);
        scriptElements.delete(fileName);
    }
}

// Function to lazy load data files
function lazyLoadDataFile(fileName) {
    return new Promise((resolve, reject) => {
        if (loadedFiles.has(fileName)) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = `database/${fileName}`;
        script.async = true;

        script.onload = () => {
            // Store the script element for later cleanup
            scriptElements.set(fileName, script);
            resolve(true);
        };

        script.onerror = () => {
            cleanupScript(fileName);
            reject(new Error(`Failed to load ${fileName}`));
        };

        document.body.appendChild(script);
    });
}

// Function to load data files in chunks
async function loadDataChunk(fileNames, onProgress) {
    if (isLoading) return;
    isLoading = true;

    try {
        for (let i = 0; i < fileNames.length; i++) {
            const fileName = fileNames[i];
            await lazyLoadDataFile(fileName);
            
            // Clean up the script after data is merged
            setTimeout(() => cleanupScript(fileName), 100);
            
            if (onProgress) {
                onProgress((i + 1) / fileNames.length * 100);
            }
        }
    } catch (error) {
        console.error('Error loading data files:', error);
    } finally {
        isLoading = false;
    }
}

// Function to cleanup all loaded scripts
function cleanupAllScripts() {
    scriptElements.forEach((script, fileName) => {
        cleanupScript(fileName);
    });
}

// Export the functions and data
window.dataLoader = {
    mergePukData,
    getPukData,
    getAllPukData,
    loadDataChunk,
    getLoadedFiles: () => Array.from(loadedFiles),
    cleanup: cleanupAllScripts
}; 