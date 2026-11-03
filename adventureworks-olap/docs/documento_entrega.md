<!-- Plantilla del documento final. Complete los campos [ ] y reemplace las capturas.
     Luego exporte a PDF (Word/Google Docs/VS Code "Markdown PDF") como
     docs/Desafio_Practico_2_<Apellido>.pdf -->

<div align="center">

# UNIVERSIDAD DON BOSCO

### Facultad de Ingeniería — Educación a Distancia (UDB Virtual)

**Asignatura:** Datawarehouse y Minería de Datos (DMD941)

**Grupo:** [ ]

**Docente:** [ ]

## Desafío Práctico 2

### Cubo OLAP sobre AdventureWorksDW y visualización en Power BI

**Estudiante:** [Nombre completo] — **Carné:** [ ]

**Fecha de entrega:** 6 de noviembre de 2026

</div>

<div style="page-break-after: always;"></div>

## Índice
1. Introducción
2. Objetivos
3. Herramientas utilizadas
4. Descarga y restauración de la base de datos
5. Exploración e identificación de datos relevantes
6. Consultas SQL para los problemas de negocio
7. Diseño y creación del cubo OLAP
8. Despliegue, procesamiento y validación del cubo
9. Visualización en Power BI
10. Análisis de resultados
11. Conclusiones
12. Enlace al repositorio

## 1. Introducción
El presente documento describe el proceso de restauración de la base de datos de ejemplo
AdventureWorksDW en SQL Server, el diseño y procesamiento de un cubo OLAP mediante SQL Server
Analysis Services en Visual Studio, y la conexión de dicho cubo con Power BI para analizar las
ventas por Internet de la empresa Adventure Works Cycles.

## 2. Objetivos
- Restaurar correctamente la base de datos AdventureWorksDW en SQL Server.
- Identificar las tablas de hechos y dimensiones relevantes para el análisis de ventas.
- Responder los problemas de negocio mediante consultas SQL optimizadas.
- Diseñar, desplegar y procesar un cubo OLAP que responda a los mismos problemas.
- Construir un tablero en Power BI conectado en vivo al cubo.

## 3. Herramientas utilizadas
| Herramienta | Versión |
|---|---|
| SQL Server | [ ] |
| SQL Server Management Studio | [ ] |
| SQL Server Analysis Services (Multidimensional) | [ ] |
| Visual Studio + Analysis Services Projects | [ ] |
| Power BI Desktop | [ ] |

## 4. Descarga y restauración de la base de datos
Se descargó el archivo `AdventureWorksDW2022.bak` desde la documentación oficial de Microsoft,
columna *Data Warehouse*, en la versión que coincide con la instancia instalada. La restauración
se realizó con el script `sql/01_restaurar_base_datos.sql`.

![Versión de SQL Server](capturas/00_version_sql.png)
![Restauración completada](capturas/00_restore_ok.png)

## 5. Exploración e identificación de datos relevantes
Con `sql/02_verificacion_restauracion.sql` se inventariaron las tablas y sus relaciones.
Para el análisis se seleccionó el hecho **FactInternetSales** y las dimensiones **DimDate,
DimProduct (con subcategoría y categoría), DimCustomer, DimSalesTerritory y DimPromotion**.
Se descartaron, para este alcance, FactResellerSales, FactFinance y otras tablas de hechos.

![Inventario de tablas](capturas/00_inventario_tablas.png)

[Insertar diagrama del esquema estrella/copo de nieve (captura del DSV)]

## 6. Consultas SQL para los problemas de negocio
| # | Problema | Consulta |
|---|---|---|
| 1 | Evolución de ventas y utilidad por año y trimestre | `03_problemas_negocio.sql` — Problema 1 |
| 2 | Categorías y subcategorías con mayor ingreso y margen | Problema 2 |
| 3 | Top 10 productos más rentables | Problema 3 |
| 4 | Concentración de ventas por territorio | Problema 4 |
| 5 | Perfil del cliente que más compra | Problema 5 |
| 6 | Impacto de las promociones | Problema 6 |

[Por cada problema: captura de la consulta y su resultado + 2–3 líneas de interpretación]

## 7. Diseño y creación del cubo OLAP
[Capturas 01 a 12 de `guia_cubo_ssas.md` con una breve descripción de cada paso]

## 8. Despliegue, procesamiento y validación del cubo
[Capturas 13 a 22: deploy, process, browser, consultas MDX y comparación con SQL]

## 9. Visualización en Power BI
[Capturas 23 en adelante de `guia_powerbi.md`]

## 10. Análisis de resultados
[Responda cada problema con cifras: p. ej. “El año con mayores ventas fue ____ con $____,
la categoría Bicicletas representa el ____ % de las ventas…”]

## 11. Conclusiones
- [ ]
- [ ]
- [ ]

## 12. Enlace al repositorio
https://github.com/menendez2004/datawarehouse
