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



// === Отправка формы ===
$("#testform").on("submit", async function(e) {
    e.preventDefault();
    const form = this;
    const $button = $(form).find('button[type="submit"]');

    showSpinner();
    $button.prop("disabled", true);

    // === URL-параметры ===
    const urlParams = getUrlParams();
    const testid = urlParams["testid"] || generateUUID();

    // === Сбор данных формы ===
    const formData = {};
    for (let i = 1; i <= 18; i++) {
        formData[`q${i}`] = $(`input[name="q${i}"]:checked`, form).val() || "";
    }

    // === Метаданные ===
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

    // === Получение IP ===
    try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        meta.ip = data.ip || "";
    } catch {
        meta.ip = "";
    }

    // === Отправка через AJAX ===
    const LAMBDA_URL = "https://service.nexson.space/psytests/send_test_data";
    const payload = { ...formData, ...meta };

    $.ajax({
        url: LAMBDA_URL,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(payload),
        success: function(responseText) {
            let result;
            try {
                if (typeof responseText === "string") responseText = JSON.parse(responseText);
                result = typeof responseText.body === "string"
                    ? JSON.parse(responseText.body)
                    : responseText.body || responseText;
            } catch {
                console.error("JSON parse error");
                result = { success: false, message: "Некорректный ответ сервера" };
            }

            if (result.success) {
                toastr.success(result.message || "Форма успешно отправлена", "Успех!");
                form.reset();
                window.location.href = "/thank_you_page.html"; // заменить на свою страницу
            } else {
                toastr.error(result.message || "Ошибка при отправке", "Ошибка!");
            }
        },
        error: function(xhr, status, error) {
            toastr.error("Ошибка при отправке формы", "Ошибка!");
            console.error("AJAX Error:", status, error);
        },
        complete: function() {
            hideSpinner();
            $button.prop("disabled", false);
        }
    });
});
