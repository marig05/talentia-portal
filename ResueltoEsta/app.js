/**
 * ResueltoEsta - Lógica Interactiva del Portal de Registro Corporativo
 * Implementa navegación SPA, micro-interacciones, transiciones fluidas y validaciones.
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- Elementos de Navegación ---
    const views = {
        welcome: document.getElementById("view-welcome"),
        empresa: document.getElementById("view-form-empresa"),
        candidato: document.getElementById("view-form-candidato"),
        login: document.getElementById("view-login"),
        success: document.getElementById("view-success")
    };

    const footer = document.getElementById("portal-footer");
    const footerToggleBtn = document.getElementById("footer-toggle-btn");
    const logoHomeBtn = document.getElementById("logo-home-btn");
    
    // Botones de Selección de Rol
    const btnRoleEmpresa = document.getElementById("btn-role-empresa");
    const btnRoleCandidato = document.getElementById("btn-role-candidato");

    // Botones de retroceso y reinicio
    const backToWelcomeButtons = document.querySelectorAll(".btn-go-welcome");

    // Formularios
    const formEmpresa = document.getElementById("form-empresa");
    const formCandidato = document.getElementById("form-candidato");
    const formLogin = document.getElementById("form-login");

    // Estado actual de la vista activa
    let currentView = "welcome";

    /**
     * Navegación SPA con Animaciones Fluidas (Fade & Slide)
     * @param {string} targetViewName - Nombre de la vista destino
     */
    function navigateTo(targetViewName) {
        if (targetViewName === currentView) return;

        const currentViewEl = views[currentView];
        const targetViewEl = views[targetViewName];

        if (!currentViewEl || !targetViewEl) return;

        // 1. Ocultar la vista actual (desvanecer)
        currentViewEl.classList.remove("active");
        
        // Esperamos a que la animación de salida termine (300ms de acuerdo a la variable CSS)
        setTimeout(() => {
            currentViewEl.style.display = "none";
            
            // 2. Mostrar la nueva vista
            targetViewEl.style.display = "flex";
            
            // Forzar un reflow para que el navegador registre el cambio de display antes de la animación
            void targetViewEl.offsetWidth;
            
            // 3. Activar animación de entrada (fade & slide up)
            targetViewEl.classList.add("active");
            currentView = targetViewName;
            
            // 4. Gestionar visibilidad del footer y textos dinámicos
            manageFooterState(targetViewName);
        }, 300);
    }

    /**
     * Ajusta el comportamiento del footer según la pantalla activa
     * @param {string} viewName - Nombre de la pantalla actual
     */
    function manageFooterState(viewName) {
        if (viewName === "success") {
            // Ocultar footer completamente en pantalla de éxito
            footer.style.display = "none";
        } else {
            footer.style.display = "flex";
            
            if (viewName === "login") {
                footerToggleBtn.innerHTML = '¿No tienes una cuenta? <span>Regístrate aquí</span>';
                footerToggleBtn.setAttribute("aria-label", "Ir al registro");
            } else {
                footerToggleBtn.innerHTML = '¿Ya tienes una cuenta? <span>Inicia sesión</span>';
                footerToggleBtn.setAttribute("aria-label", "Ir al inicio de sesión");
            }
        }
    }

    // --- Controladores de Eventos de Navegación ---

    // Selección de rol -> Formularios correspondientes
    btnRoleEmpresa.addEventListener("click", () => navigateTo("empresa"));
    btnRoleCandidato.addEventListener("click", () => navigateTo("candidato"));

    // Logo superior -> Vuelve al inicio (Welcome)
    logoHomeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // Si estamos en éxito, reseteamos el formulario antes de volver
        if (currentView === "success") {
            resetAllForms();
        }
        navigateTo("welcome");
    });

    // Botón del Footer (Inicia Sesión <-> Regístrate / Bienvenida)
    footerToggleBtn.addEventListener("click", () => {
        if (currentView === "login") {
            navigateTo("welcome");
        } else {
            navigateTo("login");
        }
    });

    // Todos los botones de volver atrás
    backToWelcomeButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (currentView === "success") {
                resetAllForms();
            }
            navigateTo("welcome");
        });
    });


    // --- Validación de Campos y Estilo de Floating Labels ---

    // Añade la clase .has-value a los campos dinámicamente si tienen contenido
    const allInputs = document.querySelectorAll(".input-group input, .input-group select");
    
    allInputs.forEach(input => {
        // Ejecutar al cargar la página (por si hay autocompletado)
        checkInputValue(input);

        // Escuchar cambios
        input.addEventListener("blur", () => {
            checkInputValue(input);
            validateField(input); // Validar campo individual al perder el foco
        });

        input.addEventListener("input", () => {
            checkInputValue(input);
            // Si el campo ya tiene un error, volver a validar en tiempo real para quitarlo rápido
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

    // --- LÓGICA DE VALIDACIÓN ---

    // Expresiones regulares comunes
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const regexPhone = /^[0-9]{8,12}$/; // Teléfonos de Latinoamérica (8 a 12 dígitos)

    /**
     * Valida un input individualmente y muestra/oculta su mensaje de error
     * @param {HTMLInputElement|HTMLSelectElement} input - Campo a validar
     * @returns {boolean} - true si es válido
     */
    function validateField(input) {
        const group = input.closest(".input-group");
        let isValid = true;

        // Validar si es requerido y está vacío
        if (input.hasAttribute("required") && input.value.trim() === "") {
            isValid = false;
        } 
        // Validar formato de Email
        else if (input.type === "email" && !regexEmail.test(input.value)) {
            isValid = false;
        } 
        // Validar formato de Teléfono
        else if (input.type === "tel" && !regexPhone.test(input.value.replace(/\s+/g, ""))) {
            isValid = false;
        }
        // Validar longitud mínima de contraseña
        else if (input.type === "password" && input.hasAttribute("minlength") && input.value.length < parseInt(input.getAttribute("minlength"))) {
            isValid = false;
        }
        // Validar coincidencia de contraseña (Confirmación)
        else if (input.name === "passwordConfirm") {
            const form = input.closest("form");
            const originalPass = form.querySelector("input[name='password']");
            if (originalPass && input.value !== originalPass.value) {
                isValid = false;
            }
        }

        // Aplicar clases de error visual
        if (isValid) {
            group.classList.remove("error");
        } else {
            group.classList.add("error");
        }

        return isValid;
    }

    /**
     * Valida todo un formulario antes del envío
     * @param {HTMLFormElement} form - Formulario a validar
     * @returns {boolean} - true si todo el formulario es válido
     */
    function validateForm(form) {
        let isFormValid = true;

        // Validar todos los campos de texto/selects ordinarios
        const inputs = form.querySelectorAll("input:not([type='checkbox']), select");
        inputs.forEach(input => {
            const isFieldValid = validateField(input);
            if (!isFieldValid) {
                isFormValid = false;
            }
        });

        // Validar el checkbox de términos si existe
        const termsCheckbox = form.querySelector("input[type='checkbox'][required]");
        if (termsCheckbox) {
            const labelContainer = termsCheckbox.closest(".checkbox-container");
            if (!termsCheckbox.checked) {
                isFormValid = false;
                termsCheckbox.style.outline = "2px solid var(--color-danger)";
                termsCheckbox.style.outlineOffset = "4px";
                termsCheckbox.style.borderRadius = "4px";
            } else {
                termsCheckbox.style.outline = "none";
            }
        }

        return isFormValid;
    }

    /**
     * Restablece todos los formularios a su estado inicial
     */
    function resetAllForms() {
        formEmpresa.reset();
        formCandidato.reset();
        formLogin.reset();
        
        // Remover clases de error y valor de todos los grupos
        document.querySelectorAll(".input-group").forEach(group => {
            group.classList.remove("error", "has-value");
        });

        // Limpiar estilos específicos del checkbox
        document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
            checkbox.style.outline = "none";
        });
    }


    // --- CONTROL DE ENVÍO DE FORMULARIOS (MOCK ACTIONS) ---

    /**
     * Procesa el envío simulado de un registro
     * @param {HTMLFormElement} form - El formulario enviado
     * @param {HTMLButtonElement} submitBtn - El botón de submit correspondiente
     * @param {string} emailValue - El correo registrado para mostrar en pantalla de éxito
     * @param {string} role - El rol del usuario ("empresa" o "candidato")
     * @param {object} data - Datos adicionales del usuario para el perfil
     */
    function handleFormSubmit(form, submitBtn, emailValue, role, data) {
        if (!validateForm(form)) {
            // Foco en el primer campo con error para accesibilidad
            const firstError = form.querySelector(".input-group.error input, .input-group.error select");
            if (firstError) firstError.focus();
            return;
        }

        // Bloquear interfaz mostrando el spinner de carga
        submitBtn.classList.add("loading");
        submitBtn.disabled = true;
        const allInputsInForm = form.querySelectorAll("input, select, button");
        allInputsInForm.forEach(el => el.disabled = true);

        // Simulamos una latencia de red de 1.5 segundos para reflejar un entorno corporativo real
        setTimeout(() => {
            // Desbloquear botón y controles
            submitBtn.classList.remove("loading");
            submitBtn.disabled = false;
            allInputsInForm.forEach(el => el.disabled = false);

            // Inyectar el correo del usuario en la pantalla de éxito
            document.getElementById("success-email-text").innerText = emailValue;

            // Configurar acción del botón de éxito dinámicamente según el rol
            const successActionBtn = document.getElementById("btn-success-action");
            const successActionText = document.getElementById("btn-success-action-text");
            
            if (role === "empresa") {
                successActionText.innerText = "Ir al Panel de Empresa";
                successActionBtn.onclick = () => {
                    window.location.href = `empresa.html?nombre=${encodeURIComponent(data.nombre)}&email=${encodeURIComponent(emailValue)}`;
                };
            } else {
                successActionText.innerText = "Completar Perfil Profesional";
                successActionBtn.onclick = () => {
                    window.location.href = `perfil.html?nombre=${encodeURIComponent(data.nombre)}&email=${encodeURIComponent(emailValue)}&telefono=${encodeURIComponent(data.telefono)}`;
                };
            }

            // Navegar a la pantalla de éxito
            navigateTo("success");
        }, 1500);
    }

    // Evento Formulario Empresa
    formEmpresa.addEventListener("submit", (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById("btn-submit-empresa");
        const email = document.getElementById("empresa-email").value;
        const nombre = document.getElementById("empresa-nombre").value;
        handleFormSubmit(formEmpresa, submitBtn, email, "empresa", { nombre: nombre });
    });

    // Evento Formulario Candidato
    formCandidato.addEventListener("submit", (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById("btn-submit-candidato");
        const email = document.getElementById("candidato-email").value;
        const nombre = document.getElementById("candidato-nombre").value;
        const telefono = document.getElementById("candidato-telefono").value;
        handleFormSubmit(formCandidato, submitBtn, email, "candidato", { nombre: nombre, telefono: telefono });
    });

    // Evento Formulario Login
    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById("btn-submit-login");
        
        if (!validateForm(formLogin)) {
            return;
        }

        submitBtn.classList.add("loading");
        submitBtn.disabled = true;

        // Simular inicio de sesión
        setTimeout(() => {
            submitBtn.classList.remove("loading");
            submitBtn.disabled = false;
            
            const email = document.getElementById("login-email").value.trim().toLowerCase();
            const contrasena = document.getElementById("login-password").value;
            const loginRole = document.getElementById("login-role").value;
            
            resetAllForms();
            
            // Validación de credenciales de prueba del usuario (marigar05@gmail.con y marigar05@gmail.com con clave 1234)
            if ((email === "marigar05@gmail.con" || email === "marigar05@gmail.com") && contrasena === "1234") {
                if (loginRole === "empresa") {
                    window.location.href = `empresa.html?nombre=Mari%20Empresa&email=${encodeURIComponent(email)}`;
                } else {
                    window.location.href = `perfil.html?nombre=Mari%20Trabajador&email=${encodeURIComponent(email)}&telefono=5512345678`;
                }
            } else {
                // Validación para cualquier otro correo (comportamiento por defecto)
                if (loginRole === "empresa" || email.includes("empresa")) {
                    window.location.href = `empresa.html?nombre=Empresa%20Demo&email=${encodeURIComponent(email)}`;
                } else {
                    window.location.href = `perfil.html?nombre=Candidato%20Demo&email=${encodeURIComponent(email)}&telefono=5512345678`;
                }
            }
        }, 1200);
    });
});
