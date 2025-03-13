// Global object to store combined PUK data
let combinedPukData = {};

// Function to merge new data into the combined data
function mergePukData(newData) {
    combinedPukData = {
        ...combinedPukData,
        ...newData
    };
}

// Function to get data for a specific MSISDN
function getPukData(msisdn) {
    return combinedPukData[msisdn] || null;
}

// Function to get all available data
function getAllPukData() {
    return combinedPukData;
}

// Export the functions and data
window.dataLoader = {
    mergePukData,
    getPukData,
    getAllPukData
}; 