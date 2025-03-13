// Theme switching
document.addEventListener('DOMContentLoaded', () => {
    // Initialize data loader with existing pukData if available
    if (typeof pukData !== 'undefined') {
        window.dataLoader.mergePukData(pukData);
    }

    const elements = {
        msisdnInput: document.getElementById('msisdnInput'),
        searchButton: document.getElementById('searchButton'),
        resultsGrid: document.getElementById('resultsGrid'),
        noResults: document.getElementById('noResults'),
        resultsContainer: document.getElementById('resultsContainer'),
        pukValue: document.getElementById('pukValue'),
        iccidValue: document.getElementById('iccidValue'),
        updatedAtValue: document.getElementById('updatedAtValue'),
        themeToggle: document.getElementById('themeToggle'),
        heading: document.querySelector('h1'),
        themeSwitch: document.querySelector('.theme-switch')
    };

    // Check if all required elements are present
    const missingElements = Object.entries(elements)
        .filter(([_, element]) => !element)
        .map(([key]) => key);

    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
        return;
    }

    // Format input as phone number with shake animation for non-numeric input
    elements.msisdnInput.addEventListener('input', (e) => {
        const originalValue = e.target.value;
        const numericValue = originalValue.replace(/\D/g, '');
        
        // If non-numeric characters were entered
        if (originalValue !== numericValue) {
            // Add shake animation
            elements.msisdnInput.classList.add('shake');
            
            // Show warning toast
            Toastify({
                text: "数字のみ入力可能です",
                className: "toast-error",
                duration: 2000,
                gravity: "bottom",
                position: "right",
            }).showToast();
            
            // Remove shake class after animation completes
            setTimeout(() => {
                elements.msisdnInput.classList.remove('shake');
            }, 500);
        }
        
        // Update input value
        if (numericValue.length > 11) {
            e.target.value = numericValue.slice(0, 11);
        } else {
            e.target.value = numericValue;
        }
        
        // Update clear button visibility
        updateClearButtonVisibility();
    });

    // Handle search
    function handleSearch() {
        const msisdn = elements.msisdnInput.value;
        if (!msisdn || msisdn.length !== 11) {
            Toastify({
                text: "電話番号を11桁で入力してください。",
                className: "toast-error",
                duration: 3000,
                gravity: "bottom",
                position: "right",
            }).showToast();
            return;
        }

        const result = window.dataLoader.getPukData(msisdn);
        elements.resultsContainer.classList.add('show');

        if (result) {
            elements.resultsGrid.classList.remove('hidden');
            elements.noResults.classList.add('hidden');
            elements.pukValue.textContent = result.puk;
            elements.iccidValue.textContent = result.iccid;
            elements.updatedAtValue.textContent = result.update_at;
        } else {
            elements.resultsGrid.classList.add('hidden');
            elements.noResults.classList.remove('hidden');
        }
    }

    elements.searchButton.addEventListener('click', handleSearch);
    elements.msisdnInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Copy functionality
    document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.copy;
            const value = type === 'puk' ? elements.pukValue.textContent : elements.iccidValue.textContent;

            navigator.clipboard.writeText(value).then(() => {
                Toastify({
                    text: "コピーしました！",
                    className: "toast-success",
                    duration: 3000,
                    gravity: "bottom",
        position: "right",
                }).showToast();
            }).catch(() => {
                Toastify({
                    text: "コピーに失敗しました。",
                    className: "toast-error",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                }).showToast();
            });
        });
    });

    // Theme switching
    function initializeTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcons(theme);
    }

    function updateThemeIcons(theme) {
        const lightIcon = elements.themeToggle.querySelector('.light-icon');
        const darkIcon = elements.themeToggle.querySelector('.dark-icon');
        
        if (theme === 'dark') {
            lightIcon.classList.add('hidden');
            darkIcon.classList.remove('hidden');
        } else {
            lightIcon.classList.remove('hidden');
            darkIcon.classList.add('hidden');
        }
    }

    elements.themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcons(newTheme);
    });

    initializeTheme();

    // Toast configuration
    let toastInProgress = false;
    let currentToast = null;

    // Create clear button
    const clearButton = document.createElement('button');
    clearButton.className = 'clear-input';
    clearButton.innerHTML = '×';
    clearButton.setAttribute('aria-label', '入力をクリア');
    clearButton.style.display = 'none';
    elements.msisdnInput.parentElement.appendChild(clearButton);

    // Clear button click handler
    clearButton.addEventListener('click', () => {
        elements.msisdnInput.value = '';
        clearButton.style.display = 'none';
        elements.resultsContainer.classList.remove('show');
        elements.resultsContainer.classList.add('hidden');
        updateClearButtonVisibility();
    });

    // Update clear button visibility
    function updateClearButtonVisibility() {
        clearButton.style.display = elements.msisdnInput.value.length > 0 ? 'block' : 'none';
    }

    document.querySelectorAll('.result-label').forEach(label => {
        if (label.textContent.includes('PUK')) label.textContent = 'PUKコード';
        if (label.textContent.includes('ICCID')) label.textContent = 'ICCIDコード';
        if (label.textContent.includes('Updated')) label.textContent = '更新日時';
    });
    document.querySelectorAll('.copy-button').forEach(button => {
        button.textContent = 'コピー';
    });
}); 