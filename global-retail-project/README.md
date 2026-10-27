# Proyecto de Cátedra — Fase 1 (DMD941)

Propuesta y diseño del Datawarehouse para **Global Electronic Retail** (`SAC Retailer Dataset.xlsx`).

## Contenido
- `output/DMD941_Proyecto_Fase_1.docx` — documento de entrega (portada, problema, datos, KPIs, herramientas, diseño, ETL y cronograma)
- `sql/dw_schema.sql` — DDL del esquema estrella en PostgreSQL (esquema `dw`)
- `diagrams/star_schema.png` — diagrama de hechos y dimensiones
- `diagrams/cronograma.png` — diagrama de Gantt de la fase de implementación
- `docs/build_doc.py` — script que perfila el Excel y genera los diagramas y el documento

## Herramientas seleccionadas
- **Power BI** — reporte interactivo de KPIs
- **K-means** — segmentación de clientes (Python / scikit-learn)

## Regenerar el documento
```bash
python -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python docs/build_doc.py "../SAC Retailer Dataset.xlsx"
```
Los datos de la portada (alumno, docente, fecha) se editan al inicio de `docs/build_doc.py`.
