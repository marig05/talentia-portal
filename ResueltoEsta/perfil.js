/**
 * ResueltoEsta - Lógica Interactiva del Perfil de Candidato
 * Administra la carga interactiva de archivos, validación de datos y notificaciones (toasts).
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- Campos de Información Personal ---
    const inputNombre = document.getElementById("perfil-nombre");
    const inputTelefono = document.getElementById("perfil-telefono");
    const inputUbicacion = document.getElementById("perfil-ubicacion");
    const emailSubtitle = document.getElementById("avatar-email-text");
    const avatarMonogram = document.getElementById("avatar-monogram");
    const formPerfil = document.getElementById("form-perfil");
    const btnSaveProfile = document.getElementById("btn-save-profile");
    const toastContainer = document.getElementById("toast-container");

    // --- Inputs y Visuales de Carga de Archivos ---
    const files = {
        cv: {
            input: document.getElementById("input-cv"),
            item: document.getElementById("item-cv"),
            nameText: document.getElementById("name-cv"),
            statusIcon: document.getElementById("status-cv"),
            label: "Currículum (PDF)"
        },
        cartaPres: {
            input: document.getElementById("input-carta-pres"),
            item: document.getElementById("item-carta-pres"),
            nameText: document.getElementById("name-carta-pres"),
            statusIcon: document.getElementById("status-carta-pres"),
            label: "Carta de Presentación"
        },
        cartaRec: {
            input: document.getElementById("input-carta-rec"),
            item: document.getElementById("item-carta-rec"),
            nameText: document.getElementById("name-carta-rec"),
            statusIcon: document.getElementById("status-carta-rec"),
            label: "Cartas de Recomendación"
        }
    };

    // --- 1. Lectura de Parámetros URL (Integración con Registro) ---
    function loadUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const nameParam = params.get("nombre");
        const emailParam = params.get("email");
        const phoneParam = params.get("telefono");

        if (nameParam) {
            inputNombre.value = decodeURIComponent(nameParam);
            inputNombre.closest(".input-group").classList.add("has-value");
            updateAvatar(inputNombre.value);
        }
        if (emailParam) {
            emailSubtitle.innerText = decodeURIComponent(emailParam);
        }
        if (phoneParam) {
            inputTelefono.value = decodeURIComponent(phoneParam);
            inputTelefono.closest(".input-group").classList.add("has-value");
        }
    }

    // Actualiza el monograma del avatar con la primera letra del nombre
    function updateAvatar(name) {
        if (name && name.trim() !== "") {
            avatarMonogram.innerText = name.trim().charAt(0).toUpperCase();
        } else {
            avatarMonogram.innerText = "C";
        }
    }

    inputNombre.addEventListener("input", () => {
        updateAvatar(inputNombre.value);
    });

    // --- 2. Lógica Interactiva para Carga de Archivos ---
    
    // Configura cada fila de carga
    Object.keys(files).forEach(key => {
        const fileObj = files[key];
        
        fileObj.input.addEventListener("change", (e) => {
            const fileList = e.target.files;
            
            if (fileList.length > 0) {
                const file = fileList[0];
                
                // Actualizar UI para reflejar archivo cargado
                fileObj.nameText.innerText = `${file.name} (${formatBytes(file.size)})`;
                fileObj.item.classList.add("has-file");
                fileObj.statusIcon.classList.add("uploaded");
                fileObj.statusIcon.setAttribute("title", "Archivo cargado exitosamente");
                
                // Mostrar notificación Toast
                showToast(`¡${fileObj.label} cargado con éxito!`);
            } else {
                // Si se cancela o limpia la selección
                fileObj.nameText.innerText = `Ningún archivo seleccionado`;
                fileObj.item.classList.remove("has-file");
                fileObj.statusIcon.classList.remove("uploaded");
                fileObj.statusIcon.setAttribute("title", "Pendiente de carga");
            }
        });
    });

    // Formateador de bytes para tamaño de archivo
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // --- 3. Validación de Campos Personales ---
    
    const regexPhone = /^[0-9]{8,12}$/;

    function validateField(input) {
        const group = input.closest(".input-group");
        let isValid = true;

        if (input.hasAttribute("required") && input.value.trim() === "") {
            isValid = false;
        } else if (input.type === "tel" && !regexPhone.test(input.value.replace(/\s+/g, ""))) {
            isValid = false;
        }

        if (isValid) {
            group.classList.remove("error");
        } else {
            group.classList.add("error");
        }

        return isValid;
    }

    // Eventos de validación al perder foco y al escribir
    const personalInputs = [inputNombre, inputTelefono, inputUbicacion];
    personalInputs.forEach(input => {
        // Floating label check inicial
        if (input.value.trim() !== "") {
            input.closest(".input-group").classList.add("has-value");
        }

        input.addEventListener("blur", () => {
            if (input.value.trim() !== "") {
                input.closest(".input-group").classList.add("has-value");
            } else {
                input.closest(".input-group").classList.remove("has-value");
            }
            validateField(input);
        });

        input.addEventListener("input", () => {
            if (input.value.trim() !== "") {
                input.closest(".input-group").classList.add("has-value");
            }
            if (input.closest(".input-group").classList.contains("error")) {
                validateField(input);
            }
        });
    });

    // --- 4. Guardado Final del Perfil (Mock Submit) ---
    formPerfil.addEventListener("submit", (e) => {
        e.preventDefault();

        // Validar todos los campos
        let isFormValid = true;
        personalInputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            // Dar foco al primer campo erróneo
            const firstError = document.querySelector(".input-group.error input");
            if (firstError) firstError.focus();
            return;
        }

        // Mostrar animación de carga en botón
        btnSaveProfile.classList.add("loading");
        btnSaveProfile.disabled = true;
        personalInputs.forEach(input => input.disabled = true);
        document.querySelectorAll(".btn-upload-file").forEach(btn => btn.disabled = true);

        // Simular latencia de guardado en el servidor corporativo (1.5 segundos)
        setTimeout(() => {
            // Quitar animación de carga
            btnSaveProfile.classList.remove("loading");
            btnSaveProfile.disabled = false;
            personalInputs.forEach(input => input.disabled = false);
            document.querySelectorAll(".btn-upload-file").forEach(btn => btn.disabled = false);

            // Alerta Toast de éxito
            showToast("¡Perfil profesional guardado con éxito!");
        }, 1500);
    });

    // --- 5. Sistema de Alertas Toast Flotantes ---
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

        // Forzar reflow para animación CSS
        void toast.offsetWidth;
        toast.classList.add("show");

        // Desvanecer y remover después de 3 segundos
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    }

    // --- 6. Carga de Foto de Perfil de Candidato ---
    const btnUploadPhoto = document.getElementById("btn-upload-candidato-photo");
    const photoInput = document.getElementById("candidato-photo-input");

    if (btnUploadPhoto && photoInput && avatarMonogram) {
        btnUploadPhoto.addEventListener("click", () => {
            photoInput.click();
        });

        photoInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.startsWith("image/")) {
                    showToast("Por favor selecciona una imagen.");
                    return;
                }

                const imageUrl = URL.createObjectURL(file);
                avatarMonogram.style.backgroundImage = `url('${imageUrl}')`;
                avatarMonogram.textContent = ""; // Ocultar inicial monograma
                
                showToast("¡Foto de perfil cargada con éxito!");
            }
        });
    }

    // Inicializar lectura de parámetros al cargar
    loadUrlParams();
});
