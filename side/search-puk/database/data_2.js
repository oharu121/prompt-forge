// Additional PUK data
const pukData2 = {
    "07033445566": {
        iccid: "8923440000010033445",
        puk: "33445566",
        update_at: "2024/03/21"
    },
    "07077889900": {
        iccid: "8923440000010077889",
        puk: "77889900",
        update_at: "2024/03/22"
    }
};

// Merge with existing data
if (typeof window.dataLoader !== 'undefined') {
    window.dataLoader.mergePukData(pukData2);
} 