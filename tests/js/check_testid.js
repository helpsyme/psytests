function getUrlParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams.entries()) {
        params[key] = value;
    }
    return params;
}

document.addEventListener("DOMContentLoaded", async function() {
    const urlParams = getUrlParams();
    const testid = urlParams["testid"];

    if (!testid || testid.trim() === "") {
        window.location.href = "/404.html";
        return;
    }

    showSpinner();

    try {
        // POST-запрос на API
        const response = await fetch("https://service.nexson.space/psytests/check_testid", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ testid: testid })
        });

        const result = await response.json();

        // API возвращает { body: '{"valid":true}' } 
        const data = JSON.parse(result.body);
        alert("data: " + data);
        // Проверка валидности
        if (!data.valid) {

            // window.location.href = "/404.html";
            return;
        }

    } catch (error) {
        alert("Ошибка проверки testid: " + error);
        // window.location.href = "/404.html";
        return;
    } finally {
        hideSpinner();
    }
});