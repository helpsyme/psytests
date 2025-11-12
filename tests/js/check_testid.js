function getUrlParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams.entries()) {
        params[key] = value;
    }
    return params;
}

$(document).ready(function() {
    const urlParams = getUrlParams();
    const testid = urlParams["testid"];

    if (!testid || testid.trim() === "") {
        console.warn("TestID отсутствует в URL, редирект на 404");
        window.location.href = "/404.html";
        return;
    }

    showSpinner();

    console.log("Отправка POST-запроса на проверку testid:", testid);

    $.ajax({
        url: "https://service.nexson.space/psytests/check_testid",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ testid: testid }),
        success: function(response) {
            console.log("Ответ от API:", response);

            let data;
            try {
                data = typeof response.body === "string" ? JSON.parse(response.body) : response.body;
            } catch (err) {
                console.error("Ошибка парсинга body:", err, response);
                alert("Ошибка обработки ответа от сервера");
                window.location.href = "/404.html";
                return;
            }

            console.log("Распарсенный body:", data);

            if (!data.valid) {
                console.warn("TestID не валиден:", testid);
                window.location.href = "/404.html";
                return;
            }

            console.log("TestID валиден:", testid);
        },
        error: function(xhr, status, error) {
            console.error("Ошибка проверки testid:", status, error, xhr.responseText);
            alert("Ошибка проверки testid. Подробности в консоли.");
            window.location.href = "/404.html";
        },
        complete: function() {
            hideSpinner();
        }
    });
});