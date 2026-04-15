/**
 * design-system.js
 * Inicializa los componentes JS del Design System de Rayito DJ.
 * Se ejecuta automáticamente al cargar. Para componentes inyectados
 * dinámicamente, llama a RDS.init(containerElement) manualmente.
 */
(function() {
    'use strict';

    /**
     * Inicializa todos los .rds-select dentro de un contenedor dado.
     * Llama a RDS.init(el) después de inyectar HTML dinámico.
     */
    function initSelects(root) {
        root = root || document;
        root.querySelectorAll('.rds-select:not([data-rds-ready])').forEach(function(el) {
            el.setAttribute('data-rds-ready', '1');

            var trigger  = el.querySelector('.rds-select__trigger');
            var options  = el.querySelectorAll('.rds-select__option');
            var optWrap  = el.querySelector('.rds-select__options');
            if (!trigger || !optWrap) return;

            // Mostrar valor inicial (la opción .selected o la primera)
            var initial = el.querySelector('.rds-select__option.selected') || options[0];
            if (initial) trigger.childNodes[0]
                ? (trigger.childNodes[0].textContent = initial.textContent)
                : (trigger.textContent = initial.textContent);

            // Toggle dropdown
            trigger.addEventListener('click', function(e) {
                e.stopPropagation();
                var isOpen = el.classList.contains('open');
                // Cerrar todos los demás
                document.querySelectorAll('.rds-select.open').forEach(function(o) { o.classList.remove('open'); });
                if (!isOpen) el.classList.add('open');
            });

            // Seleccionar opción
            options.forEach(function(opt) {
                opt.addEventListener('click', function(e) {
                    e.stopPropagation();
                    options.forEach(function(o) { o.classList.remove('selected'); });
                    opt.classList.add('selected');

                    // Actualizar trigger text (preservando el ::after)
                    var textNode = trigger.firstChild;
                    if (textNode && textNode.nodeType === 3) {
                        textNode.textContent = opt.textContent;
                    } else {
                        trigger.insertBefore(document.createTextNode(opt.textContent), trigger.firstChild);
                    }

                    el.setAttribute('data-value', opt.getAttribute('data-value') || opt.textContent);
                    el.classList.remove('open');

                    // Disparar evento 'change' para que el código externo reaccione
                    el.dispatchEvent(new CustomEvent('rds:change', {
                        detail: {
                            value:   opt.getAttribute('data-value') || opt.textContent,
                            label:   opt.textContent,
                            element: el
                        },
                        bubbles: true
                    }));
                });
            });
        });
    }

    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', function() {
        document.querySelectorAll('.rds-select.open').forEach(function(el) {
            el.classList.remove('open');
        });
    });

    /** API pública */
    window.RDS = {
        /**
         * Inicializa componentes RDS dentro de un contenedor.
         * @param {Element} [container=document] - Raíz donde buscar componentes
         */
        init: function(container) {
            initSelects(container || document);
        },

        /**
         * Lee el valor actual de un .rds-select por su id o elemento.
         * @param {string|Element} target - id o elemento .rds-select
         */
        getValue: function(target) {
            var el = typeof target === 'string' ? document.getElementById(target) : target;
            if (!el) return null;
            return el.getAttribute('data-value') ||
                (el.querySelector('.rds-select__option.selected') || {}).getAttribute && 
                el.querySelector('.rds-select__option.selected').getAttribute('data-value') ||
                null;
        },

        /**
         * Establece el valor de un .rds-select programáticamente.
         * @param {string|Element} target
         * @param {string} value - data-value de la opción a seleccionar
         */
        setValue: function(target, value) {
            var el = typeof target === 'string' ? document.getElementById(target) : target;
            if (!el) return;
            var opt = el.querySelector('.rds-select__option[data-value="' + value + '"]');
            if (opt) opt.click();
        }
    };

    // Auto-init al cargar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { RDS.init(); });
    } else {
        RDS.init();
    }
})();
