-- =====================================================================
-- Desafío Práctico 2 - Paso 1: Restauración de AdventureWorksDW
-- Motor: SQL Server (ejecutar en SSMS o Azure Data Studio)
--
-- El archivo .bak NO se incluye en el repositorio por su tamaño.
-- Descárguelo de la columna "Data Warehouse" en:
--   https://learn.microsoft.com/sql/samples/adventureworks-install-configure
-- y cópielo a la carpeta de backups de su instancia, por ejemplo:
--   C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\Backup\
--
-- Ajuste las variables según su versión:
--   SQL Server 2022 -> MSSQL16 / AdventureWorksDW2022
--   SQL Server 2019 -> MSSQL15 / AdventureWorksDW2019
--   SQL Server 2017 -> MSSQL14 / AdventureWorksDW2017
-- =====================================================================
USE master;
GO

-- ---------------------------------------------------------------------
-- 1.1 Versión de la instancia (evidencia para el documento)
-- ---------------------------------------------------------------------
SELECT @@VERSION                         AS VersionSQLServer,
       SERVERPROPERTY('ProductVersion')  AS NumeroVersion,
       SERVERPROPERTY('Edition')         AS Edicion;
GO

-- ---------------------------------------------------------------------
-- 1.2 Ver los nombres lógicos de los archivos dentro del .bak
--     (se usan en la cláusula MOVE del paso 1.3)
-- ---------------------------------------------------------------------
RESTORE FILELISTONLY
FROM DISK = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\Backup\AdventureWorksDW2022.bak';
GO

-- ---------------------------------------------------------------------
-- 1.3 Restaurar la base de datos
-- ---------------------------------------------------------------------
RESTORE DATABASE AdventureWorksDW2022
FROM DISK = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\Backup\AdventureWorksDW2022.bak'
WITH
    MOVE N'AdventureWorksDW2022'     TO N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\AdventureWorksDW2022.mdf',
    MOVE N'AdventureWorksDW2022_log' TO N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\AdventureWorksDW2022_log.ldf',
    RECOVERY,
    REPLACE,
    STATS = 10;
GO

-- Alternativa gráfica (SSMS): clic derecho en "Databases" -> "Restore Database..."
-- -> Device -> seleccionar el .bak -> OK. Tome captura de cada pantalla.
