/**
 * ResueltoEsta - Lógica Interactiva de la Gestión de Empresas
 * Administra el formulario de vacantes, el listado dinámico de ofertas y el FAB flotante.
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- Campos del Formulario de Vacante ---
    const inputTitulo = document.getElementById("vacante-titulo");
    const inputDescripcion = document.getElementById("vacante-descripcion");
    const inputRequisitos = document.getElementById("vacante-requisitos");
    const inputSalario = document.getElementById("vacante-salario");
    const inputJornada = document.getElementById("vacante-jornada");
    
    const formVacante = document.getElementById("form-vacante");
    const btnSubmitVacante = document.getElementById("btn-submit-vacante");
    const fabPublishBtn = document.getElementById("fab-publish-btn");
    
    // Contenedores
    const jobListContainer = document.getElementById("job-list-container");
    const jobCountBadge = document.getElementById("job-count");
    const toastContainer = document.getElementById("toast-container");

    let totalJobsCount = 1; // Ya que inicializamos con 1 vacante estática

    // --- 1. Control del Botón de Acción Flotante (FAB) ---
    fabPublishBtn.addEventListener("click", () => {
        // Enfocar el primer input del formulario de publicación
        inputTitulo.focus();
        
        // Desplazamiento suave al formulario
        formVacante.scrollIntoView({ behavior: "smooth", block: "center" });
        
        // Feedback visual sutil (animación en el borde del input enfocado)
        const group = inputTitulo.closest(".input-group");
        group.style.transform = "scale(1.02)";
        setTimeout(() => {
            group.style.transform = "scale(1)";
        }, 200);

        showToast("Listo para redactar tu vacante");
    });

    // --- 2. Floating Labels y Validación Interactiva ---
    const formInputs = [inputTitulo, inputDescripcion, inputRequisitos, inputSalario, inputJornada];

    function validateField(input) {
        const group = input.closest(".input-group");
        let isValid = true;

        if (input.hasAttribute("required") && input.value.trim() === "") {
            isValid = false;
        }

        if (isValid) {
            group.classList.remove("error");
        } else {
            group.classList.add("error");
        }

        return isValid;
    }

    formInputs.forEach(input => {
        // Inicializar etiquetas flotantes
        checkInputValue(input);

        input.addEventListener("blur", () => {
            checkInputValue(input);
            validateField(input);
        });

        input.addEventListener("input", () => {
            checkInputValue(input);
            if (input.closest(".input-group").classList.contains("error")) {
                validateField(input);
            }
        });
    });

    function checkInputValue(input) {
        const group = input.closest(".input-group");
        if (input.value.trim() !== "") {
            group.classList.add("has-value");
        } else {
            group.classList.remove("has-value");
        }
    }

    // --- 3. Envío del Formulario (Creación dinámica de vacante) ---
    formVacante.addEventListener("submit", (e) => {
        e.preventDefault();

        // Validar todos los campos
        let isFormValid = true;
        formInputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            const firstError = document.querySelector(".input-group.error input, .input-group.error textarea");
            if (firstError) firstError.focus();
            return;
        }

        // Mostrar spinner de carga en el botón
        btnSubmitVacante.classList.add("loading");
        btnSubmitVacante.disabled = true;
        formInputs.forEach(input => input.disabled = true);

        // Simular llamada al servidor para registrar oferta (1.5 segundos)
        setTimeout(() => {
            // Quitar animación de carga
            btnSubmitVacante.classList.remove("loading");
            btnSubmitVacante.disabled = false;
            formInputs.forEach(input => input.disabled = false);

            // Crear y añadir la nueva oferta dinámicamente
            createNewVacancyCard(
                inputTitulo.value,
                inputDescripcion.value,
                inputSalario.value,
                inputJornada.value
            );

            // Resetear el formulario
            formVacante.reset();
            formInputs.forEach(input => checkInputValue(input));

            // Actualizar contador
            totalJobsCount++;
            jobCountBadge.innerText = `${totalJobsCount} ${totalJobsCount === 1 ? 'Oferta' : 'Ofertas'}`;

            // Toast de confirmación
            showToast("¡Vacante publicada exitosamente!");

            // Desplazarse suavemente hacia la nueva vacante añadida
            const lastVacancyCard = jobListContainer.lastElementChild;
            if (lastVacancyCard) {
                setTimeout(() => {
                    lastVacancyCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }, 300);
            }

        }, 1500);
    });

    /**
     * Construye e inyecta una nueva tarjeta de vacante en el listado
     */
    function createNewVacancyCard(titulo, descripcion, salario, jornada) {
        const card = document.createElement("div");
        card.className = "vacancy-card";
        
        card.innerHTML = `
            <div class="vacancy-card-header">
                <div class="vacancy-card-title">${escapeHTML(titulo)}</div>
                <span class="vacancy-card-badge">${escapeHTML(jornada)}</span>
            </div>
            <p class="vacancy-card-desc">${escapeHTML(descripcion)}</p>
            <div class="vacancy-card-meta">
                <div class="vacancy-card-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="4" width="20" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                    <span>Publicado Recientemente</span>
                </div>
                <div class="vacancy-card-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    <span>${escapeHTML(salario)}</span>
                </div>
            </div>
        `;
        
        jobListContainer.appendChild(card);
    }

    // Escapado básico de HTML para prevenir inyecciones XSS locales
    function escapeHTML(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // --- 4. Sistema Toast ---
    function showToast(message) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `
            <div class="toast-icon-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <span>${message}</span>
        `;
        toastContainer.appendChild(toast);

        void toast.offsetWidth;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    }

    // --- 5. Leer parámetros URL y prellenar información de la empresa ---
    function loadUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const nameParam = urlParams.get("nombre");
        
        const companyNameText = document.getElementById("company-name-text");
        const companyLogoPlaceholder = document.getElementById("company-logo-placeholder");

        if (nameParam) {
            const cleanName = decodeURIComponent(nameParam).trim();
            if (companyNameText) {
                companyNameText.textContent = cleanName;
            }
            if (companyLogoPlaceholder && cleanName.length > 0) {
                companyLogoPlaceholder.textContent = cleanName.charAt(0).toUpperCase();
            }
        }
    }

    // --- 6. Carga interactiva de Logo de la Empresa ---
    const btnUploadLogo = document.getElementById("btn-upload-company-logo");
    const logoInput = document.getElementById("company-logo-input");
    const logoPlaceholder = document.getElementById("company-logo-placeholder");

    if (btnUploadLogo && logoInput && logoPlaceholder) {
        btnUploadLogo.addEventListener("click", () => {
            logoInput.click();
        });

        logoInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.startsWith("image/")) {
                    showToast("Por favor selecciona una imagen.");
                    return;
                }

                const imageUrl = URL.createObjectURL(file);
                logoPlaceholder.style.backgroundImage = `url('${imageUrl}')`;
                logoPlaceholder.textContent = ""; // Ocultar monograma
                
                showToast("¡Logo corporativo cargado con éxito!");
            }
        });
    }

    // Inicializar carga de parámetros
    loadUrlParams();
});
