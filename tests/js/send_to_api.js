let fingerprint = "";

// === Инициализация FingerprintJS ===
(async () => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    fingerprint = result.visitorId;
    console.log("FingerprintJS visitorId:", fingerprint);
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
    console.log("URL параметры:", params);
    return params;
}

// === Обработка отправки формы ===
$(document).ready(function() {
    $("#form").on("submit", function(e) {
        e.preventDefault();

        const form = this;
        const $button = $(form).find('button[type="submit"]');
        showSpinner();
        $button.prop("disabled", true);

        const urlParams = getUrlParams();
        const testid = urlParams["testid"] || generateUUID();
        console.log("Используемый testid:", testid);

        // --- Сбор данных формы ---
        const formData = {};
        for (let i = 1; i <= 18; i++) {
            formData[`q${i}`] = $(`input[name="q${i}"]:checked`, form).val() || "";
        }
        console.log("Данные формы:", formData);

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
        console.log("Метаданные:", meta);

        // --- Получаем IP, потом отправляем форму ---
        $.ajax({
            url: "https://api.ipify.org?format=json",
            type: "GET",
            success: function(ipRes) {
                meta.ip = ipRes.ip || "";
                sendPayload(form, $button, formData, meta);
            },
            error: function(err) {
                console.warn("Не удалось получить IP", err);
                meta.ip = "";
                sendPayload(form, $button, formData, meta);
            }
        });
    });
});

// === Функция отправки данных на Lambda ===
function sendPayload(form, $button, formData, meta) {
    const payload = { ...formData, ...meta };
    console.log("Payload для отправки:", payload);

    $.ajax({
        url: "https://service.nexson.space/psytests/send_test_data",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(payload),
        success: function(response) {
            console.log("Ответ от Lambda:", response);

            let result;
            try {
                if (typeof response === "string") response = JSON.parse(response);
                result = typeof response.body === "string" ? JSON.parse(response.body) : response.body || response;
            } catch (err) {
                console.error("Ошибка парсинга ответа:", err, response);
                result = { success: false, message: "Некорректный ответ сервера" };
            }

            console.log("Распарсенный результат:", result);

            if (result.success) {
                toastr.success(result.data.message || "Форма успешно отправлена", "Успех!");
                form.reset();

                // --- Редирект после небольшой задержки, чтобы toastr успел показать уведомление ---
                setTimeout(() => {
                    window.location.href = "/result_page.html";
                }, 500);
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
}