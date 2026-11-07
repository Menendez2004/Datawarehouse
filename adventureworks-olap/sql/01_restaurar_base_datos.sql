USE master;
GO

SELECT @@VERSION                         AS VersionSQLServer,
       SERVERPROPERTY('ProductVersion')  AS NumeroVersion,
       SERVERPROPERTY('Edition')         AS Edicion;
GO

RESTORE FILELISTONLY
FROM DISK = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\Backup\AdventureWorksDW2022.bak';
GO

-- Ajustar MSSQL16 y el nombre del .bak según la versión de SQL Server instalada
RESTORE DATABASE AdventureWorksDW2022
FROM DISK = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\Backup\AdventureWorksDW2022.bak'
WITH
    MOVE N'AdventureWorksDW2022'     TO N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\AdventureWorksDW2022.mdf',
    MOVE N'AdventureWorksDW2022_log' TO N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\AdventureWorksDW2022_log.ldf',
    RECOVERY,
    REPLACE,
    STATS = 10;
GO
