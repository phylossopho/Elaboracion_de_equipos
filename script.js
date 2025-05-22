// Variables globales
let dbData = {}; // Usaremos un objeto para un acceso más rápido: {'Material|Color': cantidad}
// Lista de materiales en el orden deseado
const materiales = [
  // Materiales de emperador (4)
  { nombre: "Voluntad del emperador", tipo: "emperador" },
  { nombre: "Guardia del emperador", tipo: "emperador" },
  { nombre: "Alma del emperador", tipo: "emperador" },
  { nombre: "Aliento del emperador", tipo: "emperador" },
  // materiales raros (12)
  { nombre: "Quijada ácida", tipo: "raro" },
  { nombre: "Oro talón", tipo: "raro" },
  { nombre: "Hoja de jade", tipo: "raro" },
  { nombre: "Ámbar hierba", tipo: "raro" },
  { nombre: "Carbonizada gnarl", tipo: "raro" },
  { nombre: "Acero reforzado", tipo: "raro" },
  { nombre: "Pluma stick", tipo: "raro" },
  { nombre: "Extracto destilado", tipo: "raro" },
  { nombre: "Razor diente de sierra", tipo: "raro" },
  { nombre: "Piel de terciopelo", tipo: "raro" },
  { nombre: "Crystal mystic", tipo: "raro" },
  { nombre: "Tempest stardust", tipo: "raro" },
  // materiales normales (12)
  { nombre: "Maxilar", tipo: "normal" },
  { nombre: "Garra", tipo: "normal" },
  { nombre: "Hoja", tipo: "normal" },
  { nombre: "Césped", tipo: "normal" },
  { nombre: "Nudo", tipo: "normal" },
  { nombre: "Acero", tipo: "normal" },
  { nombre: "Pluma", tipo: "normal" },
  { nombre: "Extraer", tipo: "normal" },
  { nombre: "Diente de sierra", tipo: "normal" },
  { nombre: "Pelaje", tipo: "normal" },
  { nombre: "Cristal", tipo: "normal" },
  { nombre: "Stardust", tipo: "normal" }
];

// Definimos los colores con un orden preferente para la tabla
const colores = ['Dorado', 'Morado', 'Azul', 'Verde', 'Blanco']; // Orden preferente

// Función para mostrar una pestaña específica
function showTab(tabId) {
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  const activePane = document.getElementById(tabId);
  if (activePane) {
    activePane.classList.add('active');
  }

  const activeLink = document.querySelector(`.nav-link[data-tab-target="${tabId}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// Lógica de rutas de imagen con guiones bajos y .jpg
function getImagePath(materialName) { // Eliminamos 'color' porque las imágenes son de material base
    let normalizedMatName = materialName.toLowerCase().replace(/\s/g, '_');

    // Mapeo de nombres de material normalizados a nombres de archivo reales si son diferentes
    // Asegúrate de que estos nombres de archivo (sin la extensión .jpg) existen en tu carpeta 'images/'
    const fileNameCorrections = {
        "hoja_de_jade": "hoja_jade",           // Si tu archivo es 'hoja_iade.jpg'
        "quijada_ácida": "quijada_acida",       // Si tu archivo es 'quijada_acida.jpg' (sin acento)
        "carbonizada_gnarl": "carbonizada_gnarl",
        "acero_reforzado": "acero_reforzado",
        "diente_de_sierra": "diente_sierra",
        "razor_diente_de_sierra": "razor_diente_sierra",
        "voluntad_del_emperador": "voluntad_emperador",
        "guardia_del_emperador": "guardia_emperador",
        "alma_del_emperador": "alma_emperador",
        "aliento_del_emperador": "aliento_emperador",
        "oro_talón": "oro_talon",               // Corregido: 'talon' sin acento si tu archivo es así
        "ámbar_hierba": "ambar_hierba",         // Corregido: 'ambar' sin acento si tu archivo es así
        "piel_de_terciopelo": "piel_terciopelo", // Corregido: 'piel_terciopelo' si tu archivo es así (sin 'de')
        "césped": "cesped"                      // Corregido: 'cesped' sin acento si tu archivo es así
    };

    // Aplica la corrección si existe, de lo contrario usa el nombre normalizado
    normalizedMatName = fileNameCorrections[normalizedMatName] || normalizedMatName;

    // Construye la ruta final de la imagen
    return `images/${normalizedMatName}.jpg`;
}


// Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetTabId = e.target.getAttribute('data-tab-target');
      if (targetTabId) {
        showTab(targetTabId);
      }
    });
  });

  document.getElementById('newDbBtn').addEventListener('click', () => {
    dbData = {}; // Reiniciar dbData a un objeto vacío para una nueva DB
    renderMaterialTable(); // Renderizar la tabla con todo en 0
    showTab('db'); // Asegurarse de que la pestaña DB esté activa
  });

  document.getElementById('loadCsvBtn').addEventListener('click', () => {
    document.getElementById('csvFileInput').click(); // Disparar el clic del input de archivo
  });

  document.getElementById('csvFileInput').addEventListener('change', loadCsv);

  document.getElementById('exportCsvBtn').addEventListener('click', exportCsv); // Evento para el botón de exportar

  showTab('action'); // Mostrar la primera pestaña por defecto al cargar

  // Asegurarse de que la tabla de materiales se renderice al cargar la pestaña DB
  document.querySelector('.nav-link[data-tab-target="db"]').addEventListener('click', () => {
      // Solo renderizar si la tabla no existe o si se recargó la DB
      if (!document.getElementById('materialInventoryTable')) { // Solo renderizar si no está ya renderizada
          renderMaterialTable(); // Iniciar con una tabla vacía al abrir la pestaña por primera vez
      }
      // Re-renderizar para reflejar cambios si la DB fue modificada en otra parte (ej. por localStorage)
      renderMaterialTable();
  });

  // Si la página se carga directamente en la pestaña DB (ej. al refrescar)
  // Intentar cargar desde localStorage primero, si no hay, renderizar la tabla vacía
  if (document.getElementById('db').classList.contains('active')) {
      const savedData = localStorage.getItem('materialDB');
      if (savedData) {
          try {
              dbData = JSON.parse(savedData);
          } catch (e) {
              console.error("Error al parsear datos de localStorage:", e);
              dbData = {}; // En caso de error, reiniciar
          }
      }
      renderMaterialTable();
  } else {
      // Si la pestaña de acción es la activa, pero queremos precargar los datos si existen
      const savedData = localStorage.getItem('materialDB');
      if (savedData) {
        try {
            dbData = JSON.parse(savedData);
        } catch (e) {
            console.error("Error al parsear datos de localStorage:", e);
            dbData = {};
        }
      }
  }

  // Calcular y establecer el offset para la columna "sticky" del nombre del material
  // Necesita ser dinámico porque el ancho de la primera columna (imagen) puede variar con CSS media queries
  const setStickyOffsets = () => {
      const firstColHeader = document.querySelector('.material-inventory-table thead th:nth-child(1)');
      if (firstColHeader) {
          const firstColWidth = firstColHeader.offsetWidth;
          document.documentElement.style.setProperty('--sticky-offset-material', `${firstColWidth}px`);
          // Para media queries, los valores fijos para móviles deben ser los que usas en CSS
          // --sticky-offset-material-mobile: 45px;
          // --sticky-offset-material-mobile-sm: 40px;
          // No necesitamos recalcularlos aquí si ya están fijos en CSS, solo asegurarnos que CSS los use
      }
  };

  // Llamar al establecer offsets cuando la tabla se renderiza y al redimensionar
  window.addEventListener('resize', setStickyOffsets);
  // Al renderizar la tabla por primera vez, también establece los offsets
  document.addEventListener('tableRendered', setStickyOffsets); // Dispararemos este evento

});


// Función para renderizar la tabla completa de materiales y colores
function renderMaterialTable() {
    const tableContainer = document.getElementById('materialTableContainer');
    tableContainer.innerHTML = ''; // Limpiar cualquier tabla anterior

    const table = document.createElement('table');
    table.id = 'materialInventoryTable';
    table.className = 'material-inventory-table';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Encabezado de la tabla (Imagen | Material | Colores...)
    let headerHtml = '<tr><th></th><th>Material</th>'; // Th vacío para la imagen
    colores.forEach(color => {
        headerHtml += `<th>${color}</th>`;
    });
    headerHtml += '</tr>';
    thead.innerHTML = headerHtml;
    table.appendChild(thead);

    // Filas de la tabla (Materiales y sus cantidades por color)
    materiales.forEach(mat => {
        const tr = document.createElement('tr');
        const imagePath = getImagePath(mat.nombre); // Obtenemos la imagen base del material

        // Columna de la imagen
        tr.innerHTML = `<td><img src="${imagePath}" alt="${mat.nombre}" class="material-icon" onerror="this.style.display='none'"></td>`;
        tr.innerHTML += `<th>${mat.nombre}</th>`; // Nombre del material en la segunda columna (ahora th)

        colores.forEach(color => {
            const key = `${mat.nombre}|${color}`;
            // Modificado: Si dbData[key] es 0 o undefined, se muestra un string vacío.
            const currentQty = dbData[key] > 0 ? dbData[key] : '';

            // Determinar la clase de color para la celda
            const colorClass = color.toLowerCase().replace(/\s/g, ''); // ej. 'dorado', 'blanco'

            tr.innerHTML += `
                <td class="color-${colorClass}">
                    <input type="number" class="qty-input"
                           value="${currentQty}"
                           min="0"
                           data-material="${mat.nombre}"
                           data-color="${color}" />
                </td>
            `;
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableContainer.appendChild(table);

    // Añadir event listeners a los inputs de cantidad
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const material = e.target.dataset.material;
            const color = e.target.dataset.color;
            const newQty = parseInt(e.target.value);
            const key = `${material}|${color}`;

            if (isNaN(newQty) || newQty < 0) {
                alert('La cantidad debe ser un número entero mayor o igual a 0.');
                e.target.value = dbData[key] > 0 ? dbData[key] : ''; // Restaurar valor anterior
                return;
            }

            if (newQty === 0) {
                delete dbData[key]; // Si la cantidad es 0, eliminar la entrada del dbData
                e.target.value = ''; // Asegurarse de que el input muestre en blanco
            } else {
                dbData[key] = newQty; // Actualizar la cantidad en el objeto dbData
            }

            // Opcional: Persistir datos en localStorage automáticamente
            localStorage.setItem('materialDB', JSON.stringify(dbData));
            console.log(`Cantidad actualizada para ${material} (${color}): ${newQty}`);
        });
    });

    // Disparar evento personalizado después de que la tabla se haya renderizado
    document.dispatchEvent(new Event('tableRendered'));
}


// Función para cargar CSV (adaptada para el nuevo formato dbData)
function loadCsv(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
        const lines = evt.target.result.trim().split('\n');
        // Asume que el CSV tiene encabezados: Material,Color,Cantidad
        const parsedData = {};
        if (lines.length > 0) {
            lines.slice(1).forEach(line => { // Omitir el encabezado
                const parts = line.split(',');
                if (parts.length >= 3) { // Asegurarse de que haya suficientes partes
                    const mat = parts[0].trim(); // Eliminar espacios en blanco
                    const color = parts[1].trim(); // Eliminar espacios en blanco
                    const qtyStr = parts[2].trim();
                    const qty = parseInt(qtyStr);
                    if (!isNaN(qty) && qty > 0) { // Solo añadir si la cantidad es válida y positiva
                        parsedData[`${mat}|${color}`] = qty;
                    }
                }
            });
        }
        dbData = parsedData; // Actualizar la base de datos global
        localStorage.setItem('materialDB', JSON.stringify(dbData)); // Guardar en localStorage
        renderMaterialTable(); // Re-renderizar la tabla con los datos cargados
        showTab('db'); // Asegurarse de que la pestaña DB esté activa
    };
    reader.readAsText(file);
}

// Función para exportar CSV (adaptada para el nuevo formato dbData)
function exportCsv() {
    const rows = [['Material', 'Color', 'Cantidad']]; // Encabezado CSV

    // Convertir dbData de objeto a array de filas, respetando el orden definido
    materiales.forEach(mat => {
        colores.forEach(color => {
            const key = `${mat.nombre}|${color}`;
            const quantity = dbData[key];
            if (quantity && quantity > 0) { // Solo añadir si la cantidad es positiva
                rows.push([mat.nombre, color, quantity]);
            }
        });
    });

    if (rows.length === 1) { // Solo el encabezado
        alert('No hay datos para exportar. La tabla está vacía.');
        return;
    }

    const csv = rows.map(r => r.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'materia_db.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}