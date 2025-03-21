// Theme switching
document.addEventListener('DOMContentLoaded', () => {
    // Initialize data loader with existing pukData if available
    if (typeof pukData !== 'undefined') {
        window.dataLoader.mergePukData(pukData, 'data.js');
    }

    const elements = {
        themeToggle: document.getElementById('themeToggle'),
        searchButton: document.getElementById('searchButton'),
        msisdnInput: document.getElementById('msisdnInput'),
        resultsContainer: document.getElementById('resultsContainer'),
        resultsGrid: document.getElementById('resultsGrid'),
        noResults: document.getElementById('noResults'),
        pukValue: document.getElementById('pukValue'),
        iccidValue: document.getElementById('iccidValue'),
        updatedAtValue: document.getElementById('updatedAtValue'),
        mailButton: document.getElementById('mailButton'),
        ticketButton: document.getElementById('ticketButton'),
        modalBackdrop: document.getElementById('modalBackdrop'),
        mailModal: document.getElementById('mailModal'),
        ticketModal: document.getElementById('ticketModal'),
        mailTemplateContent: document.getElementById('mailTemplateContent'),
        ticketTemplateContent: document.getElementById('ticketTemplateContent'),
        copyMailTemplate: document.getElementById('copyMailTemplate'),
        copyTicketTemplate: document.getElementById('copyTicketTemplate'),
        clearMailTemplate: document.getElementById('clearMailTemplate'),
        clearTicketTemplate: document.getElementById('clearTicketTemplate'),
        closeMailModal: document.getElementById('closeMailModal'),
        closeTicketModal: document.getElementById('closeTicketModal'),
        msisdnValue: document.getElementById('msisdnValue')
    };

    // Global variables
    const storedData = {
        mailItems: [],
        ticketItems: []
    };
    let currentResult = null;
    let foundResults = false;

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

    // Handle search with lazy loading
    async function handleSearch() {
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

        // Show loading state
        const originalButtonText = elements.searchButton.textContent;
        elements.searchButton.disabled = true;
        elements.searchButton.innerHTML = `検索 <span class="spinner"></span>`;

        try {
            // Load additional data files if needed
            const dataFiles = ['data_2.js', 'data_3.js'];
            await window.dataLoader.loadDataChunk(dataFiles);

            const result = window.dataLoader.getPukData(msisdn);
            elements.resultsContainer.classList.add('show');

            currentResult = {
                msisdn: msisdn,
                data: result
            };
            
            foundResults = !!result;

            if (result) {
                elements.resultsGrid.classList.remove('hidden');
                elements.noResults.classList.add('hidden');
                elements.pukValue.textContent = result.puk;
                elements.iccidValue.textContent = result.iccid;
                elements.updatedAtValue.textContent = result.update_at;
                elements.msisdnValue.textContent = formatMsisdn(msisdn);
                
                // Enable mail button, disable ticket button
                elements.mailButton.classList.remove('disabled');
                elements.ticketButton.classList.add('disabled');
            } else {
                elements.resultsGrid.classList.add('hidden');
                elements.noResults.classList.remove('hidden');
                
                // Enable ticket button, disable mail button
                elements.ticketButton.classList.remove('disabled');
                elements.mailButton.classList.add('disabled');
            }
        } catch (error) {
            console.error('Search error:', error);
            Toastify({
                text: "データの読み込みに失敗しました。",
                className: "toast-error",
                duration: 3000,
                gravity: "bottom",
                position: "right",
            }).showToast();
        } finally {
            // Reset button state
            elements.searchButton.disabled = false;
            elements.searchButton.innerHTML = originalButtonText;
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
            let value;
            
            switch(type) {
                case 'puk':
                    value = elements.pukValue.textContent;
                    break;
                case 'iccid':
                    value = elements.iccidValue.textContent;
                    break;
                case 'msisdn':
                    value = elements.msisdnValue.textContent;
                    break;
                default:
                    value = '';
            }

            copyToClipboard(value, `${type === 'msisdn' ? '電話番号' : type.toUpperCase()}をコピーしました！`);
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

    // Drag functionality
    interact('.draggable').draggable({
        inertia: true,
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: 'body',
                endOnly: true
            })
        ],
        autoScroll: true,
        listeners: {
            start(event) {
                const element = event.target;
                element.classList.add('dragging');
                
                // Only allow dragging if we have search results
                if (!currentResult) {
                    event.interaction.stop();
                    Toastify({
                        text: "検索結果がありません。",
                        className: "toast-error",
                        duration: 2000,
                        gravity: "bottom",
                        position: "right",
                    }).showToast();
                    return;
                }
            },
            move(event) {
                const element = event.target;
                const dataX = parseFloat(element.getAttribute('data-x')) || 0;
                const dataY = parseFloat(element.getAttribute('data-y')) || 0;
                
                const x = dataX + event.dx;
                const y = dataY + event.dy;
                
                element.style.transform = `translate(${x}px, ${y}px)`;
                element.setAttribute('data-x', x);
                element.setAttribute('data-y', y);
            },
            end(event) {
                const element = event.target;
                element.classList.remove('dragging');
                
                // Reset position with animation
                setTimeout(() => {
                    element.style.transition = 'transform 0.5s ease';
                    element.style.transform = 'translate(0px, 0px)';
                    element.setAttribute('data-x', 0);
                    element.setAttribute('data-y', 0);
                    
                    // Remove transition after animation completes
                    setTimeout(() => {
                        element.style.transition = '';
                    }, 500);
                }, 0);
            }
        }
    });

    // Configure drop zones
    function setupDropzone(element, isMailDropzone) {
        // Add drop zone element
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        element.appendChild(dropZone);
        
        interact(element).dropzone({
            accept: '.draggable',
            overlap: 0.4,
            ondropactivate: function(event) {
                const dropzoneElement = event.target;
                
                // Only activate appropriate dropzone based on search result
                if ((isMailDropzone && !foundResults) || (!isMailDropzone && foundResults)) {
                    return;
                }
                
                dropzoneElement.classList.add('drop-active');
            },
            ondragenter: function(event) {
                const dropzoneElement = event.target;
                
                // Only allow drop on appropriate button
                if ((isMailDropzone && !foundResults) || (!isMailDropzone && foundResults)) {
                    return;
                }
                
                dropzoneElement.classList.add('drop-target');
            },
            ondragleave: function(event) {
                event.target.classList.remove('drop-target');
            },
            ondropdeactivate: function(event) {
                event.target.classList.remove('drop-active');
                event.target.classList.remove('drop-target');
            },
            ondrop: function(event) {
                // Check if we have a valid result
                if (!currentResult) return;
                
                // Check if result already exists
                const existsInMail = storedData.mailItems.some(item => 
                    item.msisdn === currentResult.msisdn
                );
                
                const existsInTicket = storedData.ticketItems.some(item => 
                    item.msisdn === currentResult.msisdn
                );
                
                if (isMailDropzone) {
                    // Only process mail drops when we have results
                    if (!foundResults) return;
                    
                    // Check if item already exists
                    if (existsInMail) {
                        Toastify({
                            text: "この検索結果は既にメールリストに追加されています。",
                            className: "toast-error",
                            duration: 3000,
                            gravity: "bottom",
                            position: "right",
                        }).showToast();
                        return;
                    }
                    
                    // Add to mail items
                    storedData.mailItems.push(currentResult);
                    updateBadge(elements.mailButton, storedData.mailItems.length);
                    
                    Toastify({
                        text: "メールリストに追加しました。",
                        className: "toast-success",
                        duration: 2000,
                        gravity: "bottom",
                        position: "right",
                    }).showToast();
                } else {
                    // Only process ticket drops when we have no results
                    if (foundResults) return;
                    
                    // Check if item already exists
                    if (existsInTicket) {
                        Toastify({
                            text: "この検索結果は既にRSRリストに追加されています。",
                            className: "toast-error",
                            duration: 3000,
                            gravity: "bottom",
                            position: "right",
                        }).showToast();
                        return;
                    }
                    
                    // Add to ticket items
                    storedData.ticketItems.push(currentResult);
                    updateBadge(elements.ticketButton, storedData.ticketItems.length);
                    
                    Toastify({
                        text: "RSRリストに追加しました。",
                        className: "toast-success",
                        duration: 2000,
                        gravity: "bottom",
                        position: "right",
                    }).showToast();
                }
            }
        });
    }

    // Update badge with count
    function updateBadge(element, count) {
        const badge = element.querySelector('.badge');
        badge.textContent = count;
        
        if (count > 0) {
            badge.classList.remove('hidden');
            element.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
            // Don't hide the button itself, just the badge
        }
    }

    // Generate mail template
    function generateMailTemplate() {
        if (storedData.mailItems.length === 0) return '';
        
        let template = `件名: PUK情報のご案内\n\n`;
        template += `お客様各位\n\n`;
        template += `平素は弊社サービスをご利用いただき、誠にありがとうございます。\n`;
        template += `ご要望いただきましたPUK情報をご案内いたします。\n\n`;
        
        storedData.mailItems.forEach((item, index) => {
            template += `【お客様情報 ${index + 1}】\n`;
            template += `電話番号: ${formatMsisdn(item.msisdn)}\n`;
            
            if (item.data) {
                template += `PUKコード: ${item.data.puk}\n`;
                template += `ICCID: ${item.data.iccid}\n`;
            } else {
                template += `※ 該当する情報が見つかりませんでした。\n`;
            }
            
            template += `\n`;
        });
        
        template += `ご不明な点がございましたら、お気軽にお問い合わせください。\n\n`;
        template += `ご利用ありがとうございます。\n`;
        
        return template;
    }

    // Generate ticket template
    function generateTicketTemplate() {
        if (storedData.ticketItems.length === 0) return '';
        
        let template = `【RSR起票内容】\n\n`;
        template += `■ 件名: PUK情報検索依頼\n\n`;
        template += `■ 内容:\n`;
        template += `以下の電話番号のPUK情報を検索できませんでした。\n`;
        template += `システム上で確認をお願いいたします。\n\n`;
        
        template += `■ 対象電話番号:\n`;
        storedData.ticketItems.forEach((item, index) => {
            template += `${index + 1}. ${formatMsisdn(item.msisdn)}\n`;
        });
        
        template += `\n■ 優先度: 中\n`;
        template += `■ 対応期限: ${new Date(Date.now() + 86400000).toLocaleDateString('ja-JP')}\n\n`;
        
        return template;
    }

    // Show modal
    function showModal(modal) {
        elements.modalBackdrop.classList.remove('hidden');
        modal.classList.remove('hidden');
        
        // Force a reflow to ensure transitions work properly
        void elements.modalBackdrop.offsetWidth;
        void modal.offsetWidth;
        
        setTimeout(() => {
            elements.modalBackdrop.classList.add('visible');
            modal.classList.add('visible');
        }, 10);
    }

    // Hide modal
    function hideModal(modal) {
        elements.modalBackdrop.classList.remove('visible');
        modal.classList.remove('visible');
        
        setTimeout(() => {
            elements.modalBackdrop.classList.add('hidden');
            modal.classList.add('hidden');
        }, 300);
    }

    // Make sure modals are hidden on page load
    function initializeModals() {
        elements.modalBackdrop.classList.add('hidden');
        elements.modalBackdrop.classList.remove('visible');
        elements.mailModal.classList.add('hidden');
        elements.mailModal.classList.remove('visible');
        elements.ticketModal.classList.add('hidden');
        elements.ticketModal.classList.remove('visible');
    }

    // Initialize modals
    initializeModals();
    
    // Close modals with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal(elements.mailModal);
            hideModal(elements.ticketModal);
        }
    });

    // Mail button click
    elements.mailButton.addEventListener('click', () => {
        if (storedData.mailItems.length === 0) {
            Toastify({
                text: "メールリストにアイテムがありません。",
                className: "toast-error",
                duration: 2000,
                gravity: "bottom",
                position: "right",
            }).showToast();
            return;
        }
        
        elements.mailTemplateContent.textContent = generateMailTemplate();
        showModal(elements.mailModal);
    });

    // Ticket button click
    elements.ticketButton.addEventListener('click', () => {
        if (storedData.ticketItems.length === 0) {
            Toastify({
                text: "RSRリストにアイテムがありません。",
                className: "toast-error",
                duration: 2000,
                gravity: "bottom",
                position: "right",
            }).showToast();
            return;
        }
        
        elements.ticketTemplateContent.textContent = generateTicketTemplate();
        showModal(elements.ticketModal);
    });

    // Close modals
    elements.closeMailModal.addEventListener('click', () => {
        hideModal(elements.mailModal);
    });

    elements.closeTicketModal.addEventListener('click', () => {
        hideModal(elements.ticketModal);
    });

    elements.modalBackdrop.addEventListener('click', () => {
        hideModal(elements.mailModal);
        hideModal(elements.ticketModal);
    });

    // Copy template buttons
    elements.copyMailTemplate.addEventListener('click', () => {
        const text = elements.mailTemplateContent.textContent;
        copyToClipboard(text, 'メールテンプレートをコピーしました');
    });

    elements.copyTicketTemplate.addEventListener('click', () => {
        const text = elements.ticketTemplateContent.textContent;
        copyToClipboard(text, 'RSR起票テンプレートをコピーしました');
    });

    // Initialize dropzones
    setupDropzone(elements.mailButton, true);
    setupDropzone(elements.ticketButton, false);

    // Initially disable both buttons
    elements.mailButton.classList.add('disabled');
    elements.ticketButton.classList.add('disabled');

    // Format MSISDN with hyphens (e.g., 070-1234-5678)
    function formatMsisdn(msisdn) {
        if (!msisdn) return '';
        
        // Remove any non-digit characters
        const cleaned = msisdn.replace(/\D/g, '');
        
        // Format with hyphens
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        }
        
        return cleaned;
    }

    // Global objects to store template data
    const mailItems = new Set();
    const ticketItems = new Set();
    
    // Handle action buttons (mail and ticket icons)
    document.addEventListener('click', function(e) {
        // Add to mail template
        if (e.target.closest('.add-to-mail')) {
            const button = e.target.closest('.add-to-mail');
            const type = button.getAttribute('data-type');
            const value = getValueForType(type);
            
            if (value) {
                // Add to mail items
                const item = {
                    type: type,
                    label: getLabelForType(type),
                    value: value
                };
                
                const itemKey = `${type}:${value}`;
                
                if (mailItems.has(itemKey)) {
                    showToast('既に追加されています', 'error');
                    return;
                }
                
                mailItems.add(itemKey);
                updateButtonBadge('mailButton', mailItems.size);
                showToast(`${item.label}をメールに追加しました`, 'success');
                
                // Update mail template
                updateMailTemplate();
            }
        }
        
        // Add to ticket template
        if (e.target.closest('.add-to-ticket')) {
            const button = e.target.closest('.add-to-ticket');
            const type = button.getAttribute('data-type');
            const value = getValueForType(type);
            
            if (value) {
                // Add to ticket items
                const item = {
                    type: type,
                    label: getLabelForType(type),
                    value: value
                };
                
                const itemKey = `${type}:${value}`;
                
                if (ticketItems.has(itemKey)) {
                    showToast('既に追加されています', 'error');
                    return;
                }
                
                ticketItems.add(itemKey);
                updateButtonBadge('ticketButton', ticketItems.size);
                showToast(`${item.label}をRSR起票に追加しました`, 'success');
                
                // Update ticket template
                updateTicketTemplate();
            }
        }
    });
    
    // Helper to get values for different types
    function getValueForType(type) {
        const msisdn = elements.msisdnInput.value.trim();
        
        // For MSISDN, we don't need search results
        if (type === 'msisdn') {
            if (!msisdn) {
                showToast('電話番号を入力してください', 'error');
                return null;
            }
            return formatMsisdn(msisdn);
        }
        
        // For other types, we need search results
        if (!currentResult) {
            showToast('検索結果がありません', 'error');
            return null;
        }
        
        switch(type) {
            case 'puk':
                return currentResult.puk;
            case 'iccid':
                return currentResult.iccid;
            case 'update_at':
                return currentResult.update_at;
            default:
                return null;
        }
    }
    
    // Helper to get labels for different types
    function getLabelForType(type) {
        switch(type) {
            case 'msisdn':
                return '電話番号';
            case 'puk':
                return 'PUK';
            case 'iccid':
                return 'ICCID';
            case 'update_at':
                return '更新日時';
            default:
                return '';
        }
    }
    
    // Update badge on buttons
    function updateButtonBadge(buttonId, count) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        const badge = button.querySelector('.badge');
        if (!badge) return;
        
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
    
    // Update mail template content
    function updateMailTemplate() {
        if (!elements.mailTemplateContent) return;
        
        let template = '';
        
        if (mailItems.size === 0) {
            template = 'まだ項目が追加されていません。';
        } else {
            // Get current date and time
            const now = new Date();
            const dateStr = now.toLocaleDateString('ja-JP', {
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit'
            });
            
            // Get stored items
            const items = Array.from(mailItems).map(key => {
                const [type, value] = key.split(':');
                return {
                    type: type,
                    label: getLabelForType(type),
                    value: value
                };
            });
            
            // Build template
            template = `件名: 【PUK確認】${getCurrentMsisdn() || '電話番号'}\n\n`;
            template += `${dateStr}\n\n`;
            
            // Add all items
            items.forEach(item => {
                template += `${item.label}: ${item.value}\n`;
            });
            
            template += `\n以上です。ご確認ください。`;
        }
        
        elements.mailTemplateContent.textContent = template;
    }
    
    // Update ticket template content
    function updateTicketTemplate() {
        if (!elements.ticketTemplateContent) return;
        
        let template = '';
        
        if (ticketItems.size === 0) {
            template = 'まだ項目が追加されていません。';
        } else {
            // Get stored items
            const items = Array.from(ticketItems).map(key => {
                const [type, value] = key.split(':');
                return {
                    type: type,
                    label: getLabelForType(type),
                    value: value
                };
            });
            
            // Build template
            template = `# RSR起票\n\n`;
            template += `お客様情報:\n`;
            
            // Add all items
            items.forEach(item => {
                template += `${item.label}: ${item.value}\n`;
            });
            
            template += `\n操作者: ${getUserName() || '担当者名'}\n`;
            template += `申請理由: PUK確認`;
        }
        
        elements.ticketTemplateContent.textContent = template;
    }
    
    // Helper to get current MSISDN in formatted form
    function getCurrentMsisdn() {
        const msisdn = elements.msisdnInput.value.trim();
        return msisdn ? formatMsisdn(msisdn) : null;
    }
    
    // Helper function to get user name (placeholder)
    function getUserName() {
        // This could be replaced with actual user data from a login system
        return '';
    }
    
    // Handle mail button click - show mail template modal
    elements.mailButton.addEventListener('click', function(e) {
        e.preventDefault();
        updateMailTemplate();
        showModal(elements.mailModal);
    });
    
    // Handle ticket button click - show ticket template modal
    elements.ticketButton.addEventListener('click', function(e) {
        e.preventDefault();
        updateTicketTemplate();
        showModal(elements.ticketModal);
    });
    
    // Copy mail template
    elements.copyMailTemplate.addEventListener('click', function() {
        const content = elements.mailTemplateContent.textContent;
        copyToClipboard(content, 'メールテンプレートをコピーしました');
    });
    
    // Copy ticket template
    elements.copyTicketTemplate.addEventListener('click', function() {
        const content = elements.ticketTemplateContent.textContent;
        copyToClipboard(content, 'RSR起票テンプレートをコピーしました');
    });
    
    // Close mail modal
    elements.closeMailModal.addEventListener('click', function() {
        hideModal(elements.mailModal);
    });
    
    // Close ticket modal
    elements.closeTicketModal.addEventListener('click', function() {
        hideModal(elements.ticketModal);
    });

    // Copy to clipboard utility function
    function copyToClipboard(text, successMessage) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showToast(successMessage || 'コピーしました', 'success');
            })
            .catch(err => {
                console.error('Clipboard write failed:', err);
                showToast('コピーに失敗しました', 'error');
            });
    }

    // Show toast message
    function showToast(message, type = 'default') {
        Toastify({
            text: message,
            className: type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : '',
            duration: type === 'error' ? 3000 : 2000,
            gravity: "bottom",
            position: "right",
        }).showToast();
    }

    // Clear mail template
    elements.clearMailTemplate.addEventListener('click', function() {
        mailItems.clear();
        updateButtonBadge('mailButton', 0);
        updateMailTemplate();
        showToast('メールテンプレートをクリアしました', 'success');
    });
    
    // Clear ticket template
    elements.clearTicketTemplate.addEventListener('click', function() {
        ticketItems.clear();
        updateButtonBadge('ticketButton', 0);
        updateTicketTemplate();
        showToast('RSR起票テンプレートをクリアしました', 'success');
    });
}); 