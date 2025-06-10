// studio/src/app/api/specialties/route.ts

import { NextResponse } from 'next/server';
import sql from 'mssql';

// Configuración de la conexión a la base de datos usando variables de entorno
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// La función GET es la que maneja las solicitudes de tipo GET a esta ruta API.
export async function GET() {
  let pool;
  try {
    pool = await sql.connect(config);

    // Consulta para obtener todas las especialidades de la tabla dbo.Especialidades
    const result = await pool.request().query(`SELECT Id, Nombre FROM dbo.Especialidades ORDER BY Id`);

    // Devolvemos las especialidades como JSON
    return NextResponse.json({ success: true, specialties: result.recordset }, { status: 200 });

  } catch (err: any) {
    console.error('Error al obtener especialidades:', err.message);
    console.error('Detalles del error (stack trace):', err);
    return NextResponse.json({ success: false, message: 'Error interno del servidor al obtener especialidades.' }, { status: 500 });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}