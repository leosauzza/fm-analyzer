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
        let camelCaseColumn = camelCase(column);
        th.innerHTML = `${camelCaseColumn} <button class="btn btn-link p-0 text-light hide-column-btn btn-no-decoration" data-index="${index}">❌</button>`;
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

document.getElementById('customFilterButton').addEventListener('click', function () {
    const filterCondition = document.getElementById('customFilterInput').value.trim();
    if (filterCondition) {
        applyCustomFilter(filterCondition);
    } else {
        // Si el filtro está vacío, muestra todas las filas
        document.querySelectorAll('#tableBody tr').forEach(row => {
            row.style.display = '';
        });
    }
});

function applyCustomFilter(filterCondition) {
    const table = document.getElementById('dataTable');
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');

    rows.forEach(row => {
        const cells = Array.from(row.children);
        const rowData = {};

        // Mapear los nombres de las columnas con sus valores
        cells.forEach((cell, index) => {
            const thElement = table.querySelector(`thead tr:first-child th:nth-child(${index + 1})`);
            // Extraer solo el nombre de la columna antes del botón
            const header = thElement.childNodes[0].textContent.trim().toLowerCase();
            let cellValue = cell.textContent.trim();
            
            // Escapar apóstrofes en los valores
            if (isNaN(cellValue)) {
                cellValue = `'${cellValue.replace(/'/g, "\\'").toLowerCase()}'`;
            } else {
                cellValue = parseFloat(cellValue);
            }

            rowData[header] = cellValue;
        });

        // Reemplazar los nombres de columnas por los valores correspondientes en la condición
        let condition = filterCondition.toLowerCase();
        for (const key in rowData) {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            condition = condition.replace(regex, rowData[key]);
        }

        // Evaluar la condición y mostrar u ocultar la fila
        try {
            if (eval(condition)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        } catch (error) {
            console.error('Error en la evaluación del filtro:', error);
            row.style.display = 'none'; // Oculta la fila si hay un error en la condición
        }
    });
}

function camelCase(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
        .replace(/[^a-zA-Z0-9\s]/g, '') // Eliminar caracteres especiales
        .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
            return index === 0 ? match.toLowerCase() : match.toUpperCase();
        })
        .replace(/\s+/g, '');
}


