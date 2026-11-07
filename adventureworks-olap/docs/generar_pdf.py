import sys, os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                Image, PageBreak, Table, TableStyle, KeepTogether, NextPageTemplate)
from reportlab.platypus.tableofcontents import TableOfContents
from PIL import Image as PILImage

IMG, OUT = sys.argv[1], sys.argv[2]
LOGO = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "logo_udb.png")
NOMBRE = "Kevin Menéndez"
CARNE = "MZ232727"
DOCENTE = "________________________________"
GRUPO = "________"

AZUL = colors.HexColor("#1F3A5F")
GRIS = colors.HexColor("#555555")

ss = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=ss["Heading1"], fontName="Helvetica-Bold", fontSize=17,
                    textColor=AZUL, spaceBefore=6, spaceAfter=10, keepWithNext=1)
H2 = ParagraphStyle("H2", parent=ss["Heading2"], fontName="Helvetica-Bold", fontSize=13,
                    textColor=AZUL, spaceBefore=10, spaceAfter=6, keepWithNext=1)
BODY = ParagraphStyle("B", parent=ss["BodyText"], fontName="Helvetica", fontSize=10.5,
                      leading=14.5, alignment=TA_JUSTIFY, spaceAfter=6)
BUL = ParagraphStyle("BUL", parent=BODY, leftIndent=14, bulletIndent=4, spaceAfter=3)
CAP = ParagraphStyle("CAP", parent=BODY, fontName="Helvetica-Oblique", fontSize=9,
                     textColor=GRIS, alignment=TA_CENTER, spaceBefore=3, spaceAfter=12)
CEN = ParagraphStyle("CEN", parent=BODY, alignment=TA_CENTER)
CELL = ParagraphStyle("CELL", parent=BODY, fontSize=9, leading=11.5, alignment=0, spaceAfter=0)
CELLB = ParagraphStyle("CELLB", parent=CELL, fontName="Helvetica-Bold", textColor=colors.white)

fig_n = [0]
MAXW = 6.5 * inch

def fig(idx, caption, desc=None, maxh=4.1 * inch):
    path = os.path.join(IMG, f"i-{idx:03d}.png")
    w, h = PILImage.open(path).size
    s = min(MAXW / w, maxh / h)
    im = Image(path, w * s, h * s)
    im.hAlign = "CENTER"
    fig_n[0] += 1
    parts = []
    if desc:
        parts.append(Paragraph(desc, BODY))
    parts += [im, Paragraph(f"Figura {fig_n[0]}. {caption}", CAP)]
    return KeepTogether(parts)

def p(t):
    return Paragraph(t, BODY)

def bullets(items):
    return [Paragraph(i, BUL, bulletText="•") for i in items]

def table(rows, widths):
    data = [[Paragraph(str(c), CELLB if r == 0 else CELL) for c in row] for r, row in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), AZUL),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#EEF2F7")]),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#B0B8C4")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    return t

class Doc(BaseDocTemplate):
    def afterFlowable(self, f):
        if isinstance(f, Paragraph) and f.style.name in ("H1", "H2"):
            lvl = 0 if f.style.name == "H1" else 1
            self.notify("TOCEntry", (lvl, f.getPlainText(), self.page))

def deco(c, d):
    c.saveState()
    c.setFont("Helvetica", 8)
    c.setFillColor(GRIS)
    c.drawString(inch, 0.55 * inch, "Universidad Don Bosco · Datawarehouse y Minería de Datos · Desafío Práctico 2")
    c.drawRightString(letter[0] - inch, 0.55 * inch, f"Página {d.page}")
    c.setStrokeColor(AZUL)
    c.setLineWidth(0.6)
    c.line(inch, letter[1] - 0.6 * inch, letter[0] - inch, letter[1] - 0.6 * inch)
    c.restoreState()

def cover(c, d):
    W, H = letter
    c.saveState()
    c.setFillColor(AZUL)
    c.rect(0, H - 0.25 * inch, W, 0.25 * inch, fill=1, stroke=0)
    lw = 2.6 * inch
    lh = lw * 416 / 738
    c.drawImage(LOGO, (W - lw) / 2, H - 0.55 * inch - lh, lw, lh, mask="auto")
    c.setFillColor(GRIS)
    c.setFont("Helvetica", 11)
    c.drawCentredString(W / 2, H - 0.85 * inch - lh, "Facultad de Ingeniería · Educación a Distancia")
    c.setFillColor(AZUL)
    c.setFont("Helvetica", 15)
    c.drawCentredString(W / 2, H - 3.05 * inch, "Datawarehouse y Minería de Datos (DMD941)")
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(W / 2, H - 3.4 * inch, "Desafío Práctico 2")
    c.setFillColor(AZUL)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(W / 2, H - 4.2 * inch, "Documento Técnico")
    c.setFont("Helvetica-Oblique", 13)
    c.setFillColor(GRIS)
    c.drawCentredString(W / 2, H - 4.6 * inch, "Cubo OLAP, Consultas de Negocio y Visualización en Power BI")
    c.drawCentredString(W / 2, H - 4.88 * inch, "AdventureWorksDW2022")
    c.setStrokeColor(AZUL)
    c.setLineWidth(1.2)
    c.line(2 * inch, H - 5.2 * inch, W - 2 * inch, H - 5.2 * inch)
    rows = [("Alumno:", NOMBRE), ("Carné:", CARNE), ("Docente:", "Ing. David Enrique Moya Aguilar"),
            ("Fecha de entrega:", "6 de noviembre"),
            ("Stack técnico:", "SQL Server 2022 + SSAS + Visual Studio + Power BI")]
    y = H - 5.85 * inch
    for k, v in rows:
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(AZUL)
        c.drawRightString(W / 2 - 0.6 * inch, y, k)
        c.setFont("Helvetica", 12)
        c.setFillColor(colors.black)
        c.drawString(W / 2 - 0.4 * inch, y, v)
        y -= 0.38 * inch
    c.setFont("Helvetica", 10)
    c.setFillColor(GRIS)
    c.drawCentredString(W / 2, 1.0 * inch, "Repositorio: https://github.com/menendez2004/datawarehouse  ·  Rama: desafio-practico-2")
    c.restoreState()

doc = Doc(OUT, pagesize=letter, leftMargin=inch, rightMargin=inch, topMargin=0.85 * inch,
          bottomMargin=0.85 * inch, title="Desafío Práctico 2 - Cubo OLAP AdventureWorks",
          author=NOMBRE, subject="Datawarehouse y Minería de Datos (DMD941)")
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="f")
doc.addPageTemplates([PageTemplate(id="cover", frames=[frame], onPage=cover),
                      PageTemplate(id="body", frames=[frame], onPage=deco)])

S = []
S += [NextPageTemplate("body"), PageBreak()]

toc = TableOfContents()
toc.levelStyles = [ParagraphStyle("t0", fontName="Helvetica-Bold", fontSize=11, leading=16, leftIndent=0),
                   ParagraphStyle("t1", fontName="Helvetica", fontSize=10, leading=14, leftIndent=18)]
S += [Paragraph("Índice", ParagraphStyle("IDX", parent=H1)), toc, PageBreak()]

S.append(Paragraph("1. Introducción", H1))
S.append(p("El presente documento describe el proceso completo para construir una solución de inteligencia de "
           "negocios sobre la base de datos de ejemplo <b>AdventureWorksDW2022</b> de Microsoft. Se instaló SQL Server "
           "2022 Developer con Analysis Services en modo multidimensional, se restauró el almacén de datos, se "
           "respondieron seis problemas de negocio mediante consultas SQL, se diseñó y procesó un cubo OLAP en Visual "
           "Studio, se validaron sus resultados con consultas MDX y, finalmente, se conectó el cubo a Power BI para "
           "construir un tablero interactivo."))
S.append(p("El análisis se centra en las <b>ventas por Internet</b> de la empresa ficticia Adventure Works Cycles, "
           "fabricante y distribuidor de bicicletas, accesorios y prendas, entre diciembre de 2010 y enero de 2014."))

S.append(Paragraph("2. Objetivos", H1))
S += bullets([
    "Restaurar correctamente la base de datos AdventureWorksDW2022 en SQL Server.",
    "Identificar las tablas de hechos y dimensiones relevantes para el análisis de ventas.",
    "Responder los problemas de negocio planteados mediante consultas SQL precisas y optimizadas.",
    "Diseñar, desplegar y procesar un cubo OLAP que responda a los mismos problemas.",
    "Validar el cubo comparando sus resultados (MDX) con los obtenidos en SQL.",
    "Construir un reporte interactivo en Power BI conectado en vivo al cubo."])

S.append(Paragraph("3. Herramientas utilizadas", H1))
S.append(table([
    ["Herramienta", "Versión", "Uso en el desafío"],
    ["SQL Server Developer", "2022 (16.0.1000.6)", "Motor de base de datos donde se restauró el almacén de datos"],
    ["SQL Server Analysis Services", "2022 – modo Multidimensional", "Servidor donde se despliega y procesa el cubo OLAP"],
    ["SQL Server Management Studio", "22", "Restauración, consultas SQL y consultas MDX"],
    ["Visual Studio Community", "2022 + Analysis Services Projects 2022+", "Diseño del cubo (origen de datos, dimensiones, medidas)"],
    ["Power BI Desktop", "Versión actual", "Tablero de indicadores con conexión en vivo al cubo"],
    ["Git / GitHub", "—", "Control de versiones y entrega de los archivos"],
], [1.9 * inch, 1.9 * inch, 2.7 * inch]))

S.append(KeepTogether([Paragraph("3.1 Problemas de negocio planteados", H2), table([
    ["#", "Problema de negocio"],
    ["1", "¿Cómo evolucionan las ventas y la utilidad por año y trimestre, y cuál es el crecimiento interanual?"],
    ["2", "¿Qué categorías y subcategorías de producto generan más ingresos y cuál es su margen?"],
    ["3", "¿Cuáles son los 10 productos más rentables?"],
    ["4", "¿En qué grupos, países y regiones se concentran las ventas?"],
    ["5", "¿Cuál es el perfil del cliente que más compra (género, estado civil y educación)?"],
    ["6", "¿Qué impacto tienen las promociones en las ventas?"],
], [0.4 * inch, 6.1 * inch])]))

S.append(Paragraph("4. Instalación de SQL Server y restauración de la base de datos", H1))
S.append(fig(0, "Instalación de SQL Server 2022 completada.",
             "Se instaló <b>SQL Server 2022 Developer</b> con instalación personalizada, seleccionando <i>Database "
             "Engine Services</i> y <i>Analysis Services</i>. En la configuración de Analysis Services se eligió el "
             "<b>modo Multidimensional</b>, requisito para crear cubos OLAP en Visual Studio. Todas las "
             "características terminaron con estado <i>Succeeded</i>."))
S.append(fig(1, "Versión de la instancia: SQL Server 2022 (RTM) 16.0.1000.6, Developer Edition (64-bit).",
             "Desde SSMS se ejecutó el script <i>01_restaurar_base_datos.sql</i>. Su primer bloque consulta "
             "<b>@@VERSION</b> y <b>SERVERPROPERTY</b> para dejar evidencia de la versión y edición del servidor."))
S.append(fig(2, "RESTORE FILELISTONLY: nombres lógicos de los archivos del respaldo.",
             "Antes de restaurar se ejecutó <b>RESTORE FILELISTONLY</b> sobre el archivo "
             "<i>AdventureWorksDW2022.bak</i> para conocer los nombres lógicos de sus archivos: "
             "<i>AdventureWorksDW2022</i> (datos) y <i>AdventureWorksDW2022_log</i> (registro). Estos nombres se "
             "usan en la cláusula MOVE de la restauración."))
S.append(fig(3, "Restauración completada: 12,242 páginas procesadas correctamente.",
             "Con <b>RESTORE DATABASE ... WITH MOVE, RECOVERY, REPLACE, STATS = 10</b> se restauró la base, "
             "ubicando los archivos .mdf y .ldf en la carpeta DATA de la instancia. El mensaje final confirma que "
             "la restauración se procesó con éxito."))

S.append(Paragraph("5. Exploración e identificación de datos relevantes", H1))
S.append(fig(4, "La base AdventureWorksDW2022 está en línea (ONLINE).",
             "El script <i>02_verificacion_restauracion.sql</i> confirma que la base quedó en estado <b>ONLINE</b>, "
             "con modelo de recuperación SIMPLE y nivel de compatibilidad 160 (SQL Server 2022)."))
S.append(fig(5, "Inventario de tablas de hechos y dimensiones con su número de filas.",
             "Se inventariaron las 52 tablas de la base clasificándolas en <b>Hechos</b>, <b>Dimensiones</b> y "
             "otras. La tabla de hechos elegida para el análisis es <b>FactInternetSales</b> (60,398 filas), que "
             "registra cada línea de venta realizada por Internet."))
S.append(fig(6, "Llaves foráneas de FactInternetSales hacia sus dimensiones.",
             "Las llaves foráneas muestran cómo se relaciona el hecho con sus dimensiones: DimCustomer, DimDate "
             "(tres veces: fecha de pedido, vencimiento y envío), DimProduct, DimPromotion, DimSalesTerritory y "
             "DimCurrency. Con base en esto se definió el modelo del cubo."))
S.append(fig(8, "Rango de fechas, conteo de órdenes, control de nulos y muestra de datos.",
             "Las ventas abarcan del <b>29/12/2010 al 28/01/2014</b>, con <b>27,659 órdenes</b> y 60,398 líneas de "
             "venta. El control de calidad no encontró valores nulos en las llaves ni en el monto, por lo que los "
             "datos son aptos para el análisis sin limpieza adicional."))
S.append(Paragraph("5.1 Modelo dimensional seleccionado", H2))
S.append(table([
    ["Elemento", "Tabla(s)", "Uso"],
    ["Hecho", "FactInternetSales", "Ventas, costo, utilidad, unidades y órdenes"],
    ["Fecha", "DimDate", "Jerarquía Año → Trimestre → Mes → Fecha"],
    ["Producto", "DimProduct → DimProductSubcategory → DimProductCategory", "Categoría, subcategoría, producto y color (copo de nieve)"],
    ["Cliente", "DimCustomer", "Género, estado civil, educación e ingreso anual"],
    ["Territorio", "DimSalesTerritory", "Grupo, país y región"],
    ["Promoción", "DimPromotion", "Promoción, tipo y descuento"],
], [1.0 * inch, 2.6 * inch, 2.9 * inch]))
S.append(PageBreak())

S.append(Paragraph("6. Consultas SQL de los problemas de negocio", H1))
S.append(p("Las consultas del script <i>03_problemas_negocio.sql</i> se escribieron con criterios de optimización: "
           "uniones por llaves sustitutas enteras (ya indexadas), agregación previa en expresiones de tabla comunes "
           "(CTE), selección únicamente de las columnas necesarias, <b>NULLIF</b> para evitar divisiones entre cero y "
           "funciones de ventana (<b>LAG</b>, <b>RANK</b>, <b>SUM() OVER</b>) en lugar de subconsultas repetidas. "
           "Las métricas usadas son: Ventas = SUM(SalesAmount), Utilidad = SUM(SalesAmount − TotalProductCost) y "
           "Margen = Utilidad / Ventas."))
S.append(fig(9, "Problema 1: ventas, utilidad y crecimiento interanual por año.",
             "<b>Problema 1.</b> Se agregan las ventas por año en una CTE y con <b>LAG</b> se calcula el crecimiento "
             "respecto al año anterior. 2013 fue el mejor año, con $16.35 millones y un crecimiento de 179.87 %."))
S.append(fig(10, "Problema 1: ventas y utilidad por año y trimestre."))
S.append(fig(11, "Problema 2: ventas, utilidad y margen por categoría y subcategoría.",
             "<b>Problema 2.</b> Se unen el hecho, el producto, la subcategoría y la categoría para obtener unidades, "
             "ventas, utilidad y margen. Las bicicletas de carretera, de montaña y de paseo encabezan las ventas."))
S.append(fig(12, "Problema 3: los 10 productos con mayor utilidad.",
             "<b>Problema 3.</b> Se agrega la utilidad por producto y se ordena con <b>RANK()</b>. Los diez productos "
             "más rentables son modelos <i>Road-150</i> y <i>Mountain-200</i>."))
S.append(fig(13, "Problema 4: órdenes, ventas y participación por grupo, país y región.",
             "<b>Problema 4.</b> Se calcula la participación de cada región con <b>SUM() OVER()</b>. Australia "
             "concentra el 30.86 % de las ventas."))
S.append(fig(14, "Problema 5: ventas por género, estado civil, educación y rango de edad.",
             "<b>Problema 5.</b> Se segmenta a los clientes por género, estado civil, nivel educativo y rango de edad "
             "al momento de la compra, calculando clientes, ventas y venta promedio por cliente."))
S.append(fig(15, "Problema 6: órdenes, unidades, ventas y utilidad por promoción.",
             "<b>Problema 6.</b> Se agrupan las ventas por promoción, tipo y porcentaje de descuento. La gran mayoría "
             "de las ventas se realizó sin descuento."))
S.append(PageBreak())

S.append(Paragraph("7. Diseño y creación del cubo OLAP", H1))
S.append(Paragraph("7.1 Proyecto en Visual Studio", H2))
S.append(fig(18, "Creación del proyecto Analysis Services Multidimensional.",
             "En Visual Studio 2022, con la extensión <i>Microsoft Analysis Services Projects 2022+</i>, se creó un "
             "proyecto <b>Analysis Services Multidimensional Project</b> llamado <b>AdventureWorksOLAP</b> dentro de "
             "la carpeta <i>adventureworks-olap/olap</i> del repositorio.", maxh=3.4 * inch))
S.append(fig(19, "Estructura inicial del proyecto en Solution Explorer.",
             "El proyecto contiene las carpetas estándar: Data Sources, Data Source Views, Cubes, Dimensions, Roles, "
             "Assemblies y Miscellaneous.", maxh=3.2 * inch))
S.append(Paragraph("7.2 Origen de datos (Data Source)", H2))
S.append(fig(20, "Conexión al origen de datos localhost.AdventureWorksDW2022.",
             "Se creó el origen de datos con el proveedor <b>Microsoft OLE DB Driver for SQL Server (MSOLEDBSQL)</b>, "
             "servidor <i>localhost</i>, autenticación de Windows y la base AdventureWorksDW2022. Como suplantación se "
             "eligió <i>Use the service account</i>; previamente se otorgó permiso de lectura (db_datareader) a la "
             "cuenta del servicio <i>NT SERVICE\\MSSQLServerOLAPService</i>."))
S.append(Paragraph("7.3 Vista del origen de datos (Data Source View)", H2))
S.append(fig(21, "Asistente del Data Source View: tablas disponibles.",
             "En el asistente del Data Source View se seleccionaron únicamente las tablas necesarias para el modelo."))
S.append(fig(22, "Las 8 tablas incluidas en el Data Source View.",
             "Se incluyeron FactInternetSales y las dimensiones DimCustomer, DimDate, DimProduct, DimProductCategory, "
             "DimProductSubcategory, DimPromotion y DimSalesTerritory. No se usó <i>Add Related Tables</i> para no "
             "agregar tablas innecesarias."))
S.append(fig(23, "Data Source y Data Source View creados.", maxh=3.2 * inch))
S.append(Paragraph("7.4 Cálculos con nombre (Named Calculations)", H2))
S.append(p("Se crearon columnas calculadas en el Data Source View para enriquecer el modelo sin modificar la base de datos:"))
S.append(table([
    ["Tabla", "Columna", "Expresión"],
    ["FactInternetSales", "Utilidad", "SalesAmount - TotalProductCost"],
    ["DimCustomer", "NombreCompleto", "FirstName + ' ' + LastName"],
    ["DimCustomer", "Genero", "CASE Gender WHEN 'M' THEN 'Masculino' ELSE 'Femenino' END"],
    ["DimCustomer", "EstadoCivil", "CASE MaritalStatus WHEN 'M' THEN 'Casado' ELSE 'Soltero' END"],
    ["DimDate", "NombreTrimestre", "'T' + CAST(CalendarQuarter AS varchar(1)) + ' ' + CAST(CalendarYear AS varchar(4))"],
    ["DimDate", "NombreMes", "SpanishMonthName + ' ' + CAST(CalendarYear AS varchar(4))"],
], [1.4 * inch, 1.3 * inch, 3.8 * inch]))
S.append(Spacer(1, 8))
S.append(KeepTogether([fig(24, "Cálculo con nombre NombreCompleto en DimCustomer.", maxh=2.6 * inch),
                       fig(25, "Cálculo con nombre NombreTrimestre en DimDate.", maxh=2.6 * inch)]))
S.append(fig(26, "Diagrama del Data Source View: esquema en copo de nieve.",
             "El diagrama muestra el modelo resultante: <b>FactInternetSales</b> al centro, relacionada con sus "
             "dimensiones, y la dimensión de producto normalizada en tres niveles (producto, subcategoría y categoría)."))

S.append(Paragraph("7.5 Dimensiones", H2))
S.append(p("Se crearon cinco dimensiones con el asistente <i>New Dimension → Use an existing table</i>, renombrando "
           "los atributos al español y asignando columnas de nombre (<b>NameColumn</b>) para mostrar descripciones "
           "en lugar de llaves numéricas."))
S.append(fig(27, "Dimensión Cliente: Cliente, Estado Civil, Género, Educación e Ingreso Anual.",
             "<b>Cliente</b> (DimCustomer): la llave CustomerKey muestra el nombre completo; se agregaron género, "
             "estado civil, nivel educativo (SpanishEducation) e ingreso anual."))
S.append(fig(28, "Dimensión Territorio: grupo, país y región.",
             "<b>Territorio</b> (DimSalesTerritory): atributos grupo, país y región, con la región como llave."))
S.append(fig(29, "Dimensión Promoción: promoción, tipo de promoción y descuento.",
             "<b>Promoción</b> (DimPromotion): nombre de la promoción en español, tipo y porcentaje de descuento."))
S.append(fig(30, "Dimensión Fecha con sus atributos y el proyecto completo en Solution Explorer.",
             "<b>Fecha</b> (DimDate): atributos año, trimestre, mes y fecha. Para que cada trimestre y mes sea único "
             "se definieron llaves compuestas (<b>KeyColumns</b>: CalendarYear + CalendarQuarter y CalendarYear + "
             "MonthNumberOfYear) y como nombre las columnas calculadas NombreTrimestre y NombreMes. La dimensión "
             "<b>Producto</b> incluye categoría y subcategoría con sus nombres en español."))
S.append(fig(36, "Relaciones de atributos de Fecha: fecha → mes → trimestre → año.",
             "Se creó la jerarquía <b>Calendario</b> (año → trimestre → mes → fecha) y se encadenaron las relaciones "
             "de atributos, lo que permite al motor agregar correctamente y navegar por niveles (drill-down).",
             maxh=3.6 * inch))

S.append(Paragraph("7.6 Cubo «Ventas Internet»", H2))
S.append(fig(31, "Cubo Ventas Internet recién creado con el asistente.",
             "Con el asistente <i>New Cube → Use existing tables</i> se tomó FactInternetSales como grupo de medidas "
             "y se asociaron las cinco dimensiones. Las fechas de vencimiento y envío se eliminaron para conservar solo "
             "la fecha de pedido."))
S.append(fig(32, "Medidas renombradas y dimensiones del cubo.",
             "Las medidas se renombraron y se les dio formato: <b>Ventas</b>, <b>Costo</b> y <b>Utilidad</b> "
             "($#,##0.00), <b>Unidades</b> (#,##0) y <b>Ordenes</b>, un conteo distinto de SalesOrderNumber que "
             "Visual Studio ubica en su propio grupo de medidas."))
S.append(table([
    ["Medida", "Origen", "Agregación"],
    ["Ventas", "SalesAmount", "Sum"],
    ["Costo", "TotalProductCost", "Sum"],
    ["Utilidad", "Utilidad (cálculo con nombre)", "Sum"],
    ["Unidades", "OrderQuantity", "Sum"],
    ["Ordenes", "SalesOrderNumber", "DistinctCount"],
    ["Margen Pct", "IIF([Ventas] = 0, NULL, [Utilidad] / [Ventas])", "Miembro calculado (Percent)"],
], [1.3 * inch, 3.2 * inch, 2.0 * inch]))
S.append(PageBreak())

S.append(Paragraph("8. Despliegue, procesamiento y validación del cubo", H1))
S.append(fig(33, "Miembro calculado Margen Pct y despliegue completado con éxito.",
             "En la pestaña <i>Calculations</i> se creó el miembro calculado <b>Margen Pct</b>. Luego se desplegó el "
             "proyecto en el servidor <i>localhost</i> (base <b>AdventureWorksOLAP</b>). La ventana <i>Deployment "
             "Progress</i> indica <b>Deployment Completed Successfully</b> y la salida reporta 0 errores y 0 "
             "advertencias."))
S.append(fig(34, "Browser del cubo conectado: medidas y dimensiones disponibles."))
S.append(fig(35, "Browser: ventas, utilidad, unidades, costo y margen por año.",
             "En el <i>Browser</i> del cubo se comprobó que las medidas se agregan correctamente por año."))
S.append(fig(37, "Navegación por la jerarquía Calendario hasta el nivel de día.",
             "La jerarquía Calendario permite bajar del año al trimestre, al mes y al día."))
S.append(fig(38, "Ventas, utilidad y margen por año y trimestre en el Browser del cubo."))

S.append(Paragraph("8.1 Consultas MDX", H2))
S.append(p("Desde SSMS, conectado a Analysis Services, se ejecutaron seis consultas MDX (archivo "
           "<i>olap/consultas_cubo.mdx</i>), una por problema de negocio. En cada figura se ve la consulta MDX a la "
           "izquierda y el Browser del cubo a la derecha. Los totales coinciden con los obtenidos en SQL, lo que "
           "valida el cubo."))
S.append(fig(45, "MDX 1: ventas, utilidad y margen por trimestre (coincide con el Problema 1 en SQL)."))
S.append(fig(46, "MDX 2: unidades, ventas, utilidad y margen por categoría y subcategoría."))
S.append(fig(47, "MDX 3: TOPCOUNT de los 10 productos con mayor utilidad."))
S.append(fig(48, "MDX 4: ventas y órdenes por grupo, país y región."))
S.append(fig(49, "MDX 5: ventas por género, estado civil y nivel educativo."))
S.append(fig(50, "MDX 6: órdenes, unidades, ventas y utilidad por promoción."))
S.append(table([
    ["Comparación (año 2013)", "SQL", "Cubo (MDX)"],
    ["Ventas T1 + T2 + T3 + T4 2013", "$16,351,550.34", "$16,351,550.34"],
    ["Ventas totales", "$29,358,677.22", "$29,358,677.22"],
    ["Utilidad total", "$12,080,883.65", "$12,080,883.65"],
], [2.6 * inch, 1.95 * inch, 1.95 * inch]))
S.append(PageBreak())

S.append(Paragraph("9. Visualización en Power BI", H1))
S.append(fig(51, "Power BI Desktop conectado en vivo al cubo (Live connection: Connected).",
             "En Power BI Desktop se usó <i>Get data → SQL Server Analysis Services database</i>, con servidor "
             "<i>localhost</i>, base <b>AdventureWorksOLAP</b> y modo <b>Connect live</b>. Así el reporte consulta "
             "directamente el cubo, y en el panel <i>Data</i> aparecen sus medidas y dimensiones."))
S.append(fig(52, "Página 1 – Ventas por Internet: KPIs, tendencia anual y ventas por categoría.",
             "<b>Página 1 (resumen).</b> Cuatro tarjetas de KPIs (Ventas $29.36M, Utilidad $12.08M, Margen 41.15 % y "
             "28K órdenes), un gráfico de columnas y línea con ventas y utilidad por año (Problema 1), un gráfico de "
             "barras de ventas por categoría (Problema 2) y un segmentador por año que filtra toda la página."))
S.append(fig(53, "Página 2 – Detalle: productos, territorios, clientes y promociones.",
             "<b>Página 2 (detalle).</b> Top 10 de productos por utilidad usando un filtro Top N (Problema 3), ventas "
             "por país (Problema 4), una matriz de ventas por género, estado civil y educación (Problema 5) y una tabla "
             "de promociones con unidades, ventas y utilidad (Problema 6)."))
S.append(PageBreak())

S.append(Paragraph("10. Análisis de resultados", H1))
S.append(Paragraph("Problema 1 – Evolución de ventas y utilidad", H2))
S.append(table([
    ["Año", "Ventas", "Crecimiento"],
    ["2010 (solo diciembre)", "$43,421.04", "—"],
    ["2011", "$7,075,525.93", "—"],
    ["2012", "$5,842,485.20", "−17.43 %"],
    ["2013", "$16,351,550.34", "+179.87 %"],
    ["2014 (solo enero)", "$45,694.72", "Año incompleto"],
], [2.4 * inch, 2.0 * inch, 2.1 * inch]))
S.append(Spacer(1, 6))
S.append(p("2013 fue el mejor año, con $16.35 millones (56 % de todas las ventas). Las ventas crecen de forma sostenida "
           "en cada trimestre de 2013, desde $2.68 M en T1 hasta $5.33 M en T4. El margen se mantiene estable entre "
           "40 % y 42 %. Los años 2010 y 2014 solo incluyen un mes, por lo que no son comparables."))
S.append(Paragraph("Problema 2 – Categorías y subcategorías", H2))
S.append(p("Las <b>bicicletas</b> generan cerca de $28.3 millones, el 96.5 % de las ventas: de carretera ($14.52 M, margen "
           "38.13 %), de montaña ($9.95 M, el mejor margen de las bicicletas con 45.35 %) y de paseo ($3.84 M, 37.84 %). "
           "Los <b>accesorios</b> venden poco pero tienen el mayor margen (62.60 %), por lo que son una oportunidad de "
           "venta cruzada. Algunas <b>prendas</b> tienen el margen más bajo (23 %)."))
S.append(Paragraph("Problema 3 – Productos más rentables", H2))
S.append(p("Los 10 productos más rentables son variantes de <b>Road-150 Red</b> y <b>Mountain-200 (Black/Silver)</b>. "
           "El primero, <i>Road-150 Red, 48</i>, aporta $474,150.84 de utilidad. La rentabilidad está concentrada en "
           "pocos modelos de bicicleta de gama alta."))
S.append(Paragraph("Problema 4 – Territorios", H2))
S.append(p("<b>Australia</b> es la región con más ventas ($9.06 M, 30.86 %), seguida del suroeste ($5.72 M) y noroeste "
           "($3.65 M) de Estados Unidos. En conjunto Estados Unidos suma unos $9.39 M (≈32 %). En Europa destacan "
           "Reino Unido ($3.39 M), Alemania ($2.89 M) y Francia ($2.64 M); Canadá es el país con menos ventas ($1.98 M)."))
S.append(Paragraph("Problema 5 – Perfil del cliente", H2))
S.append(p("Las ventas están equilibradas entre mujeres ($14.81 M) y hombres ($14.55 M). Por educación, los clientes con "
           "<b>licenciatura</b> son los que más compran ($9.90 M), seguidos de quienes cursan estudios universitarios "
           "($7.72 M). El segmento con más ventas es <b>hombres casados con licenciatura</b> ($2.76 M), y el rango de "
           "edad predominante es de 30 a 44 años."))
S.append(Paragraph("Problema 6 – Promociones", H2))
S.append(p("El 93 % de las ventas ($27.31 M en 27,119 órdenes) se realizó <b>sin descuento</b>. El descuento por volumen "
           "(entre 11 y 14 unidades) generó $2.01 M. Las promociones <i>Touring-1000</i> y <i>Touring-3000</i> tuvieron "
           "un impacto mínimo (13 y 20 unidades). Las promociones actuales no son un motor relevante de ventas."))

S.append(Paragraph("11. Conclusiones", H1))
S += bullets([
    "Se restauró AdventureWorksDW2022 en SQL Server 2022 sin errores y se identificó FactInternetSales con cinco "
    "dimensiones como el modelo adecuado para analizar las ventas por Internet.",
    "Las consultas SQL optimizadas (CTE, funciones de ventana y uniones por llaves enteras) respondieron los seis "
    "problemas de negocio con resultados claros.",
    "El cubo OLAP «Ventas Internet» se desplegó y procesó con 0 errores, y sus resultados en MDX coinciden exactamente "
    "con los de SQL, lo que confirma que el modelo es correcto.",
    "El tablero de Power BI, conectado en vivo al cubo, permite explorar los indicadores por año, categoría, producto, "
    "territorio, cliente y promoción.",
    "Para el negocio: las bicicletas concentran el 96.5 % de las ventas, 2013 fue el año de mayor crecimiento y "
    "Australia el mercado principal. Se recomienda impulsar la venta cruzada de accesorios (margen de 62.6 %) y "
    "replantear las promociones, que hoy tienen poco impacto.",
])
S.append(Paragraph("12. Repositorio", H1))
S.append(p("Los scripts SQL, las consultas MDX, el proyecto del cubo, el archivo de Power BI y este documento están "
           "disponibles en el repositorio de GitHub. Todo el trabajo de este desafío se realizó en la rama "
           "<b>desafio-practico-2</b>."))
S.append(table([
    ["Elemento", "Valor"],
    ["Repositorio", "https://github.com/menendez2004/datawarehouse"],
    ["Rama de trabajo", "desafio-practico-2"],
    ["Enlace directo a la rama", "https://github.com/menendez2004/datawarehouse/tree/desafio-practico-2"],
    ["Carpeta del desafío", "adventureworks-olap/"],
], [1.9 * inch, 4.6 * inch]))
S.append(Spacer(1, 8))
S.append(table([
    ["Ruta", "Contenido"],
    ["sql/", "Scripts de restauración, verificación y consultas de los 6 problemas de negocio"],
    ["olap/AdventureWorksOLAP/", "Proyecto de Visual Studio del cubo OLAP «Ventas Internet»"],
    ["olap/consultas_cubo.mdx", "Consultas MDX de validación del cubo"],
    ["powerbi/", "Dashboard_AdventureWorks.pbix y su exportación a PDF"],
    ["docs/", "Este documento, guías y script que genera el PDF"],
], [1.9 * inch, 4.6 * inch]))

doc.multiBuild(S)
print("ok", fig_n[0])
