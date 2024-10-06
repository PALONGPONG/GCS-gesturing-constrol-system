// fetchData.ts

interface LocalStorageData {
    method: string;
    url: string;
    body: string;
    buttonLabel: string;
    bearerToken: string;
    buttonColor: string;
}

export const fetchData = () => {
    const localStorageData = localStorage.getItem("decvice_1");

    if (!localStorageData) {
        console.error("No data found in localStorage");
        return;
    }

    const data: LocalStorageData = JSON.parse(localStorageData);

    fetch(data.url, {
        method: data.method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.bearerToken}`,
        },
        body: data.body,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(data => {
        console.log("Success:", data);
    })
    .catch(error => {
        console.error("Error:", error);
    });
};