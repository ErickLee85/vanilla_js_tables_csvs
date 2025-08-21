const APP = {
    data: [],
    updateTimeout: null,
    sortableInstance: null,
    init() {
        APP.loadData();
        APP.addListeners();
        APP.rebuildTable();
        APP.initDrawer();
        APP.initSortable();
    },
    addListeners() {
        const form = document.querySelector('form');
        form.addEventListener('submit', APP.saveData);
        document.getElementById('exportCSV').addEventListener('click', APP.exportCSV);
        document.querySelector('table tbody').addEventListener('dblclick', APP.editCell);
        document.getElementById('resetStorage').addEventListener('click', APP.resetStorage)
        document.querySelectorAll('.cancel-btn').forEach((btn) => {
            btn.addEventListener('click', APP.cancelModal)
        })
        document.getElementById('delete-btn').addEventListener('click', APP.deleteData)
        if(APP.data.length === 0) {
            console.log('app data empty')
            document.querySelector('.table-wrapper').classList.add('hidden')
        }

    },
    saveData(ev) {
        ev.preventDefault();
        const form = ev.target;
        const formData = new FormData(form);
        APP.cacheData(formData)
        APP.buildRow(formData)
        form.reset();
        document.getElementById('fname').focus();
        document.querySelector('.table-wrapper').classList.remove('hidden')
        document.querySelector('.table-wrapper').classList.add('visible')
    },
    cacheData(formData) {
        APP.data.push(Array.from(formData.values()))
        APP.saveToStorage();
        console.table(APP.data);
    },
    buildRow (formData) {
        const tbody = document.querySelector('table > tbody')
        const tr = document.createElement('tr');
        tr.setAttribute('data-row', document.querySelectorAll('tbody tr').length)
        
        // Add drag handle as first column
        let innerHTML = `<td class="sortable-handle" style="text-align: center; cursor: grab;">⋮⋮</td>`;
        
        let col = 0;
        for(let entry of formData.entries()) {
            innerHTML += `<td data-col=${col} data-name="${entry[0]}">${entry[1]}</td>`;
            col++;
        }
        
        tr.innerHTML = innerHTML;
        tbody.append(tr);
        
        // Update drag handlers for all rows including the new one
        if (APP.updateRowDragHandlers) {
            APP.updateRowDragHandlers();
        }
    },
    exportCSV() {
        APP.data.unshift(['First Name', 'Last Name', 'Email', 'Id']);
        let str = '';
        APP.data.forEach((row)=>{
            str += row.map((col)=>JSON.stringify(col)).join(',').concat('\n')
        })
        let filename = `dataexport.${Date.now()}.csv`;
        let file = new File([str], filename, {type:'text/csv'});
        let anchor = document.createElement("a");
        anchor.href = URL.createObjectURL(file);
        anchor.download = filename;
        anchor.click();


    },
    editCell(ev) {
        let cell = ev.target.closest('td');
        if(cell){
            let row = +cell.parentElement.getAttribute('data-row');
            let col = +cell.getAttribute('data-col');
            cell.contentEditable = true;
            cell.focus();
            let text = cell.textContent;
            cell.addEventListener('keydown', function save(ev) {
                if(ev.key === 'Enter' || ev.code === 'Enter') {
                    cell.contentEditable = false;
                    cell.removeEventListener('keydown', save)
                    APP.data[row][col] = cell.textContent;
                    APP.saveToStorage();
                    console.table(APP.data);
                }
            })
        }
    },
    loadData() {
        const savedData = localStorage.getItem('tableData');
        if (savedData) {
            APP.data = JSON.parse(savedData);
        }
    },
    saveToStorage() {
        localStorage.setItem('tableData', JSON.stringify(APP.data));
    },
     resetStorage () {
        let overlay = document.querySelector('.modal-overlay')
        overlay.classList.add('active')
        // if(window.confirm("Clear Table Data?")) {
        //     localStorage.clear();
        //     APP.cleanTable();
        // } else {
        //     console.log('User canceled.')
        // }
    },
    deleteData() {
        localStorage.clear();
        APP.cleanTable();
        APP.cancelModal();
    },
    cancelModal() {
        document.querySelector('.modal-overlay').classList.remove('active')
    },
    cleanTable() {
        // Clear the data array
        APP.data = [];
        
        // Clear the table body
        const tbody = document.querySelector('table > tbody');
        tbody.innerHTML = '';
        
        // Hide the table wrapper
        document.querySelector('.table-wrapper').classList.add('hidden');
        document.querySelector('.table-wrapper').classList.remove('visible');
        console.log('Table cleared and localStorage reset');
    },
    rebuildTable() {
        const tbody = document.querySelector('table > tbody');
        tbody.innerHTML = ''; // Clear existing rows
        
        if (APP.data.length > 0) {
            APP.data.forEach((rowData, index) => {
                const tr = document.createElement('tr');
                tr.setAttribute('data-row', index);
                
                // Add drag handle as first column
                let innerHTML = `<td class="sortable-handle" style="text-align: center; cursor: grab;">⋮⋮</td>`;
                
                rowData.forEach((cellData, colIndex) => {
                    innerHTML += `<td data-col=${colIndex} data-name="${APP.getFieldName(colIndex)}">${cellData}</td>`;
                });
                
                tr.innerHTML = innerHTML;
                tbody.appendChild(tr);
            });

            document.querySelector('.table-wrapper').classList.remove('hidden');
            document.querySelector('.table-wrapper').classList.add('visible');
            
            // Initialize drag handlers for rebuilt rows
            if (APP.updateRowDragHandlers) {
                APP.updateRowDragHandlers();
            }

        } else {
            document.querySelector('.table-wrapper').classList.add('hidden');
        }
    },
    getFieldName(colIndex) {
        const fieldNames = ['fname', 'lname', 'email', 'id'];
        return fieldNames[colIndex] || '';
    },
    initDrawer() {
        const drawerToggle = document.getElementById('drawerToggle');
        const sideDrawer = document.getElementById('sideDrawer');
        const contentArea = document.getElementById('contentArea');
        
        let isDrawerOpen = false;
        
        drawerToggle.addEventListener('click', () => {
            isDrawerOpen = !isDrawerOpen;
            
            if (isDrawerOpen) {
                sideDrawer.classList.add('open');
                contentArea.classList.add('drawer-open');
                drawerToggle.classList.add('drawer-open');
            } else {
                sideDrawer.classList.remove('open');
                contentArea.classList.remove('drawer-open');
                drawerToggle.classList.remove('drawer-open');
            }
        });
        
        // Close drawer when clicking outside of it
        document.addEventListener('click', (e) => {
            if (isDrawerOpen && 
                !sideDrawer.contains(e.target) && 
                !drawerToggle.contains(e.target)) {
                isDrawerOpen = false;
                sideDrawer.classList.remove('open');
                contentArea.classList.remove('drawer-open');
                drawerToggle.classList.remove('drawer-open');
            }
        });
        
        console.log('Drawer functionality initialized');
    },
    initSortable() {
        const tbody = document.querySelector('table tbody');
        
        if (!tbody) {
            console.warn('Table tbody not found');
            return;
        }

        // Use native HTML5 drag and drop instead of Shopify Draggable
        APP.makeRowsSortable(tbody);
        console.log('Native sortable functionality initialized');
    },
    makeRowsSortable(tbody) {
        let draggedRow = null;

        // Add drag functionality to all current and future rows
        const updateRowDragHandlers = () => {
            const rows = tbody.querySelectorAll('tr');
            
            rows.forEach((row, index) => {
                // Make row draggable
                row.draggable = true;
                row.setAttribute('data-row', index);
                
                // Remove existing listeners to prevent duplicates
                row.removeEventListener('dragstart', handleDragStart);
                row.removeEventListener('dragover', handleDragOver);
                row.removeEventListener('drop', handleDrop);
                row.removeEventListener('dragend', handleDragEnd);
                
                // Add event listeners
                row.addEventListener('dragstart', handleDragStart);
                row.addEventListener('dragover', handleDragOver);
                row.addEventListener('drop', handleDrop);
                row.addEventListener('dragend', handleDragEnd);
            });
        };

        function handleDragStart(e) {
            draggedRow = this;
            this.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.outerHTML);
        }

        function handleDragOver(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.dataTransfer.dropEffect = 'move';
            return false;
        }

        function handleDrop(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }

            if (draggedRow !== this) {
                const allRows = Array.from(tbody.querySelectorAll('tr'));
                const draggedIndex = allRows.indexOf(draggedRow);
                const targetIndex = allRows.indexOf(this);

                if (draggedIndex < targetIndex) {
                    this.parentNode.insertBefore(draggedRow, this.nextSibling);
                } else {
                    this.parentNode.insertBefore(draggedRow, this);
                }

                // Update data order after successful drop
                APP.updateDataOrder();
            }
            return false;
        }

        function handleDragEnd(e) {
            this.style.opacity = '';
            draggedRow = null;
        }

        // Initialize for existing rows
        updateRowDragHandlers();

        // Store the update function so we can call it when new rows are added
        APP.updateRowDragHandlers = updateRowDragHandlers;
    },
    updateDataOrder() {
        // Debounce to prevent multiple rapid calls
        clearTimeout(APP.updateTimeout);
        APP.updateTimeout = setTimeout(() => {
            console.log('Updating data order...');
            
            // Get the current order of rows in the DOM
            const rows = document.querySelectorAll('table tbody tr');
            const newDataSet = new Set();
            const newData = [];
            
            rows.forEach((row, index) => {
                // Extract data from the actual table cells (skip the first cell which is the drag handle)
                const cells = row.querySelectorAll('td[data-col]');
                const rowData = [];
                
                cells.forEach(cell => {
                    rowData.push(cell.textContent.trim());
                });
                
                if (rowData.length > 0) {
                    // Create a unique key for this row to check for duplicates
                    const rowKey = rowData.join('|');
                    
                    if (!newDataSet.has(rowKey)) {
                        newDataSet.add(rowKey);
                        newData.push(rowData);
                    }
                }
                
                // Update the row index to match new position
                row.setAttribute('data-row', index);
            });
            
            // Only update if we have the right number of unique rows
            if (newData.length === rows.length) {
                APP.data = newData;
                APP.saveToStorage();
                console.log('Data successfully reordered:', APP.data);
                console.table(APP.data);
            } else {
                console.warn('Row count mismatch, rebuilding table instead');
                APP.rebuildTable();
            }
        }, 100); // 100ms debounce
    },
}

document.addEventListener('DOMContentLoaded', APP.init)