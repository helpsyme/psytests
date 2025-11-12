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
        // Пример запроса на API для проверки testid
        const response = await fetch(`https://service.nexson.space/psytests/check_testid?testid=${encodeURIComponent(testid)}`);
        const data = await response.json();

        // Предположим API возвращает { valid: true } или { valid: false }
        if (!data.valid) {
            window.location.href = "/404.html";
            return;
        }

    } catch (error) {
        console.error("Ошибка проверки testid:", error);
        // Если ошибка сети, тоже редиректим
        window.location.href = "/404.html";
        return;
    } finally {
        hideSpinner();
    }


});