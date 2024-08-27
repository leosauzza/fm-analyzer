const fs = require('fs');
const cheerio = require('cheerio');

function parseHTMLtoJSON(html) {
    const $ = cheerio.load(html);
    
    // Obtener las cabeceras
    const headers = [];
    $('table th').each((index, element) => {
        headers.push($(element).text().trim());
    });

    // Procesar las filas
    const rows = [];
    $('table tr').each((index, row) => {
        const rowData = {};
        $(row).find('td').each((i, cell) => {
            const cellText = $(cell).text().trim();
            if (headers[i]) {
                rowData[headers[i]] = cellText;
            }
        });
        if (Object.keys(rowData).length > 0) {
            rows.push(rowData);
        }
    });

    return rows;
}

// Leer el archivo HTML
fs.readFile('data.html', 'utf8', (err, data) => {
    if (err) {
        console.error('Error leyendo el archivo HTML:', err);
        return;
    }

    const jsonData = parseHTMLtoJSON(data);

    // Guardar el JSON resultante en un archivo
    fs.writeFile('output.json', JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
            console.error('Error escribiendo el archivo JSON:', err);
            return;
        }
        console.log('JSON generado exitosamente: output.json');
    });
});
