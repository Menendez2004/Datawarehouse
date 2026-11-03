# Guía: conexión del cubo a Power BI

## 1. Conectar
1. Power BI Desktop → *Obtener datos* → **Base de datos de SQL Server Analysis Services**.
2. Servidor: `localhost` (la instancia SSAS donde se desplegó el cubo). Base de datos: `AdventureWorksOLAP`.
3. Modo: **Conectar en vivo** (Live connection) → elegir el cubo **Ventas Internet**.

📸 `23_pbi_obtener_datos.png`, `24_pbi_conexion_vivo.png`, `25_pbi_campos_cubo.png`

## 2. Reporte sugerido (una página por problema o un tablero de 2 páginas)

| Problema | Visual | Configuración |
|---|---|---|
| 1. Tendencia de ventas | Gráfico de líneas y columnas | Eje: `Fecha.Calendario` (Año → Trimestre); Columnas: Ventas; Línea: Utilidad |
| 2. Categorías | Gráfico de barras apiladas / Treemap | Eje: `Producto.Categorias`; Valores: Ventas; Tooltip: Margen Pct |
| 3. Top 10 productos | Gráfico de barras | Eje: Producto; Valor: Utilidad; Filtro del visual: *Top N = 10 por Utilidad* |
| 4. Territorio | Mapa (o mapa coroplético) + tabla | Ubicación: Pais; Tamaño: Ventas |
| 5. Perfil del cliente | Matriz + gráfico de anillo | Filas: Genero, Estado Civil; Columnas: Educacion; Valores: Ventas |
| 6. Promociones | Tabla / barras | Promocion, Unidades, Ventas, Utilidad |
| KPIs generales | Tarjetas | Ventas, Utilidad, Margen Pct, Ordenes |

Segmentadores (slicers) recomendados en todas las páginas: **Año** y **Grupo de territorio**.

## 3. Guardar
- Guarde el archivo como `powerbi/Dashboard_AdventureWorks.pbix` (este sí se sube al repositorio).
- Exporte también a PDF: *Archivo → Exportar → Exportar a PDF* → `powerbi/Dashboard_AdventureWorks.pdf`.

📸 `26_pbi_pagina1.png`, `27_pbi_pagina2.png`, … (una captura por página del reporte)
