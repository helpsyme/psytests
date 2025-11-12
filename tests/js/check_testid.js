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
    console.log("Отправка POST-запроса на проверку testid:", testid);

    // POST-запрос на API
    const response = await fetch("https://service.nexson.space/psytests/check_testid", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ testid: testid })
    });

    console.log("Ответ от fetch:", response);

    const result = await response.json();
    console.log("Распарсенный JSON от API:", result);

    // API возвращает { body: '{"valid":true}' } 
    const data = JSON.parse(result.body);
    console.log("Распарсенный body:", data);

    // Проверка валидности
    if (!data.valid) {
        console.warn("TestID не валиден:", testid);
        // window.location.href = "/404.html";
        return;
    }

    console.log("TestID валиден:", testid);

} catch (error) {
    console.error("Ошибка проверки testid:", error);
    // window.location.href = "/404.html";
} finally {
    hideSpinner();
}
});