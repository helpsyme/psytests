
let fingerprint = "";

// === Инициализация FingerprintJS ===
(async () => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    fingerprint = result.visitorId;
})();

// === Генерация UUID ===
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// === Получение параметров из URL ===
function getUrlParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams.entries()) {
        params[key] = value;
    }
    return params;
}

// === Обработка отправки формы ===
$(document).ready(function() {
    $("#testform").on("submit", function(e) {
        e.preventDefault();

        const form = this;
        const $button = $(form).find('button[type="submit"]');
        showSpinner();
        $button.prop("disabled", true);

        // --- Получаем параметры из URL ---
        const urlParams = getUrlParams();
        const testid = urlParams["testid"] || generateUUID();

        // --- Сбор данных формы ---
        const formData = {};
        for (let i = 1; i <= 18; i++) {
            formData[`q${i}`] = $(`input[name="q${i}"]:checked`, form).val() || "";
        }

        // --- Метаданные ---
        const meta = {
            testid: testid,
            testtype: $(form).find('input[name="testtype"]').val() || "",
            uuid: generateUUID(),
            host: window.location.host,
            referer: document.referrer,
            system: navigator.platform,
            userAgent: navigator.userAgent,
            language: navigator.language || navigator.userLanguage,
            fingerprint: fingerprint,
            utm_source: urlParams["utm_source"] || "",
            utm_medium: urlParams["utm_medium"] || "",
            utm_campaign: urlParams["utm_campaign"] || "",
            utm_term: urlParams["utm_term"] || "",
            utm_content: urlParams["utm_content"] || ""
        };

        // --- Сначала получаем IP, потом шлём форму ---
        $.ajax({
            url: "https://api.ipify.org?format=json",
            type: "GET",
            success: function(ipRes) {
                meta.ip = ipRes.ip || "";

                const payload = { ...formData, ...meta };

                console.log("Отправка данных формы:", payload);

                // --- Отправляем данные на Lambda ---
                $.ajax({
                    url: "https://service.nexson.space/psytests/send_test_data",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(payload),
                    success: function(response) {
                        let result;
                        try {
                            if (typeof response === "string") response = JSON.parse(response);
                            result = typeof response.body === "string"
                                ? JSON.parse(response.body)
                                : response.body || response;
                        } catch (err) {
                            console.error("Ошибка парсинга ответа:", err, response);
                            result = { success: false, message: "Некорректный ответ сервера" };
                        }

                        if (result.success) {
                            toastr.success(result.message || "Форма успешно отправлена", "Успех!");
                            form.reset();
                            window.location.href = "/thank_you_page.html"; // своя страница
                        } else {
                            toastr.error(result.message || "Ошибка при отправке", "Ошибка!");
                        }
                    },
                    error: function(xhr, status, error) {
                        toastr.error("Ошибка при отправке формы", "Ошибка!");
                        console.error("AJAX Error:", status, error, xhr.responseText);
                    },
                    complete: function() {
                        hideSpinner();
                        $button.prop("disabled", false);
                    }
                });
            },
            error: function() {
                console.warn("Не удалось получить IP");
                meta.ip = "";

                const payload = { ...formData, ...meta };

                $.ajax({
                    url: "https://service.nexson.space/psytests/send_test_data",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(payload),
                    success: function(response) {
                        toastr.success("Форма отправлена без IP", "Успех!");
                        form.reset();
                        window.location.href = "/thank_you_page.html";
                    },
                    error: function(xhr, status, error) {
                        toastr.error("Ошибка при отправке формы", "Ошибка!");
                        console.error("AJAX Error:", status, error, xhr.responseText);
                    },
                    complete: function() {
                        hideSpinner();
                        $button.prop("disabled", false);
                    }
                });
            }
        });
    });
});
