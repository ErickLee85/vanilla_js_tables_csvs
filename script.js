const APP = {
    data: [],
    init() {
        APP.loadData();
        APP.addListeners();
        APP.rebuildTable();
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
        tr.innerHTML = ''
        tr.setAttribute('data-row', document.querySelectorAll('tbody tr').length)
        let col = 0;
        for(let entry of formData.entries()) {
            tr.innerHTML += `<td data-col=${col} data-name="${entry[0]}">
            ${entry[1]}
            </>`
            col++;
        }
        tbody.append(tr)
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
                let innerHTML = '';
                
                rowData.forEach((cellData, colIndex) => {
                    innerHTML += `<td data-col=${colIndex} data-name="${APP.getFieldName(colIndex)}">${cellData}</td>`;
                });
                
                tr.innerHTML = innerHTML;
                tbody.appendChild(tr);
            });

            document.querySelector('.table-wrapper').classList.remove('hidden');
            document.querySelector('.table-wrapper').classList.add('visible');

        } else {
            document.querySelector('.table-wrapper').classList.add('hidden');
        }
    },
    getFieldName(colIndex) {
        const fieldNames = ['fname', 'lname', 'email', 'id'];
        return fieldNames[colIndex] || '';
    },
}

document.addEventListener('DOMContentLoaded', APP.init)