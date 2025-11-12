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
        // Запрос на API для проверки testid
        const response = await fetch(`https://service.nexson.space/psytests/check_testid?testid=${encodeURIComponent(testid)}`);
        const result = await response.json();


        const data = JSON.parse(result.body);
        alert("data: " + data);
        // Проверка валидности
        if (!data.valid) {
            window.location.href = "/404.html";
            return;
        }

    } catch (error) {
        alert("Ошибка проверки testid: " + error);
        window.location.href = "/404.html";
        return;
    } finally {
        hideSpinner();
    }
});