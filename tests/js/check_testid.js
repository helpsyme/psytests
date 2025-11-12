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
        console.warn("TestID отсутствует в URL, редирект на 404");
        window.location.href = "/404.html";
        return;
    }

    showSpinner();

    try {
        console.log("Отправка POST-запроса на проверку testid:", testid);

        // POST-запрос на API
        const response = await fetch("https://service.nexson.space/psytests/check_testid", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ testid }),
            mode: "cors", // включаем CORS
            credentials: "omit" // если cookies не нужны
        });

        console.log("Ответ от fetch:", response);

        if (!response.ok) {
            throw new Error(`HTTP ошибка: ${response.status}`);
        }

        const result = await response.json();
        console.log("Распарсенный JSON от API:", result);

        // API возвращает { body: '{"valid":true}' } 
        let data;
        try {
            data = JSON.parse(result.body);
        } catch (parseError) {
            console.error("Ошибка парсинга body:", parseError, result.body);
            throw parseError;
        }
        console.log("Распарсенный body:", data);

        // Проверка валидности
        if (!data.valid) {
            console.warn("TestID не валиден:", testid);
            window.location.href = "/404.html";
            return;
        }

        console.log("TestID валиден:", testid);

    } catch (error) {
        console.error("Ошибка проверки testid:", error);
        alert("Ошибка проверки testid. Подробности в консоли.");
        window.location.href = "/404.html";
    } finally {
        hideSpinner();
    }
});