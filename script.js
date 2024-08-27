document.getElementById('loadDataBtn').addEventListener('click', loadData);

function loadData() {
    fetch('output.json')
        .then(response => response.json())
        .then(data => {
            generateTable(data);
        });
}

function generateTable(data) {
    const tableHead = document.getElementById('tableHead');
    const tableBody = document.getElementById('tableBody');
    const buttonsContainer = document.getElementById('buttons-container');
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';
    buttonsContainer.innerHTML = '';

    if (data.length === 0) return;

    // Obtener las propiedades del primer objeto para los encabezados
    const columns = Object.keys(data[0]);

    // Crear el primer conjunto de encabezados (nombres de columnas)
    let headerRow1 = document.createElement('tr');
    columns.forEach((column, index) => {
        let th = document.createElement('th');
        th.innerHTML = `${column} <button class="btn btn-link p-0 text-light hide-column-btn btn-no-decoration" data-index="${index}">❌</button>`;
        headerRow1.appendChild(th);
    });
    tableHead.appendChild(headerRow1);

    // Crear el segundo conjunto de encabezados (botones de ordenamiento)
    let headerRow2 = document.createElement('tr');
    columns.forEach((column, index) => {
        let th = document.createElement('th');
        let ascButton = document.createElement('button');
        ascButton.innerHTML = '🔼';
        ascButton.className = 'sort-asc btn btn-link text-light btn-no-decoration p-0';
        ascButton.addEventListener('click', () => sortTableByColumn(index, true));

        let descButton = document.createElement('button');
        descButton.innerHTML = '🔽';
        descButton.className = 'sort-desc btn btn-link text-light btn-no-decoration p-0';
        descButton.addEventListener('click', () => sortTableByColumn(index, false));

        th.appendChild(ascButton);
        th.appendChild(descButton);
        headerRow2.appendChild(th);
    });
    tableHead.appendChild(headerRow2);

    const columnSelect = document.getElementById('columnSelect');
    columnSelect.innerHTML = ''; // Limpiar opciones previas
    columns.forEach((column, index) => {
        let option = document.createElement('option');
        option.value = index;
        option.textContent = column;
        columnSelect.appendChild(option);
    });



    // Llenar el cuerpo de la tabla con datos
    data.forEach(rowData => {
        let tr = document.createElement('tr');
        columns.forEach(column => {
            let td = document.createElement('td');
            let cellValue = rowData[column] === '-' ? 0 : rowData[column];
            cellValue = cellValue === undefined || cellValue === null || cellValue.length < 1 ? 0 : cellValue;
            td.textContent = cellValue;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });

    // Manejar ocultar y mostrar columnas
    document.querySelectorAll('.hide-column-btn').forEach(button => {
        button.addEventListener('click', function () {
            let index = this.dataset.index;
            toggleColumnVisibility(index);
        });
    });

    applyStyles();
}

function sortTableByColumn(columnIndex, isAscending) {
    const table = document.getElementById('dataTable');
    const tbody = table.querySelector('tbody');
    const rowsArray = Array.from(tbody.querySelectorAll('tr'));

    rowsArray.sort((rowA, rowB) => {
        const cellA = rowA.children[columnIndex].innerText.trim();
        const cellB = rowB.children[columnIndex].innerText.trim();

        // Determine if the column is numeric or not
        const a = isNaN(cellA) ? cellA : parseFloat(cellA);
        const b = isNaN(cellB) ? cellB : parseFloat(cellB);

        if (a < b) return isAscending ? -1 : 1;
        if (a > b) return isAscending ? 1 : -1;
        return 0;
    });

    // Append the sorted rows back into the table body
    rowsArray.forEach(row => tbody.appendChild(row));
}

function toggleColumnVisibility(columnIndex) {
    const table = document.getElementById('dataTable');
    const buttonsContainer = document.getElementById('buttons-container');
    const ths = table.querySelectorAll(`th:nth-child(${+columnIndex + 1})`);
    const tds = table.querySelectorAll(`td:nth-child(${+columnIndex + 1})`);

    ths.forEach(th => th.classList.toggle('d-none'));
    tds.forEach(td => td.classList.toggle('d-none'));

    // Si la columna está oculta, crear un botón para mostrarla
    if (ths[0].classList.contains('d-none')) {
        let showButton = document.createElement('button');
        showButton.className = 'btn btn-secondary me-2';
        showButton.textContent = ths[0].textContent.trim();
        showButton.dataset.index = columnIndex;
        showButton.addEventListener('click', function () {
            toggleColumnVisibility(this.dataset.index);
            this.remove();
        });
        buttonsContainer.appendChild(showButton);
    }
}

document.getElementById('filterInput').addEventListener('input', filterTable);

function filterTable() {
    const filterValue = document.getElementById('filterInput').value.toLowerCase();
    const columnIndex = document.getElementById('columnSelect').value;
    const rows = document.querySelectorAll('#tableBody tr');

    rows.forEach(row => {
        const cellValue = row.children[columnIndex].textContent.toLowerCase();
        if (cellValue.includes(filterValue)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function applyStyles() {
    const cells = document.querySelectorAll('#tableBody td');

    cells.forEach(cell => {
        const cellValue = parseFloat(cell.textContent.trim());

        if (!isNaN(cellValue)) {
            if (cellValue > 8 && cellValue < 11) {
                cell.style.fontWeight = 'bold';
            }
            if (cellValue > 10 && cellValue < 15) {
                cell.style.fontWeight = 'bold';
                cell.style.color = 'yellow';
            }
            if (cellValue > 14 && cellValue < 29) {
                cell.style.fontWeight = 'bold';
                cell.style.color = 'green';
            }
            if (cellValue > 28) {
                cell.style.fontWeight = 'bold';
                cell.style.color = 'red';
            }
        }
    });
}