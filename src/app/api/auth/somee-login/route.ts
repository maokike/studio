// studio/src/app/api/auth/somee-login/route.ts

import { NextResponse } from 'next/server';
import sql from 'mssql';

// Configuración de la conexión a la base de datos usando variables de entorno
// Asegúrate de que tu archivo .env.local esté en la raíz de tu proyecto 'studio'
// y contenga:
// DB_USER="Maaelias123__SQLLogin_1"
// DB_PASSWORD="fdmdmns12t"
// DB_SERVER="BD_clinica.mssql.somee.com"
// DB_DATABASE="Clinica BD"
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // Esto es común para conexiones a SQL Server en la nube como Somee
    trustServerCertificate: true // Necesario para desarrollo si el certificado no es de una CA conocida.
                                 // En producción, si usas SSL, deberías tener un certificado de confianza.
  }
};

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ success: false, message: 'Se requieren correo electrónico y contraseña.' }, { status: 400 });
  }

  let pool; // Declaramos la variable 'pool' para que podamos cerrarla en 'finally'
  try {
    // Intenta establecer la conexión a la base de datos SQL Server
    pool = await sql.connect(config);

    // *********************************************************************************
    // ¡¡ESTA ES LA LÍNEA CRÍTICA CON LA CORRECCIÓN DE LA "Ñ" Y EL COLLATE!!
    // Usamos 'COLLATE Latin1_General_CI_AS' para asegurar que la columna 'Contrasena'
    // sea tratada correctamente, incluso si hay problemas con caracteres especiales
    // como la 'ñ' o la sensibilidad a mayúsculas/minúsculas o acentos.
    // *********************************************************************************
    const result = await pool.request()
      .input('emailParam', sql.NVarChar, email)       // Mapea el 'email' recibido a un parámetro SQL @emailParam
      .input('passwordParam', sql.NVarChar, password) // Mapea el 'password' recibido a un parámetro SQL @passwordParam
      .query(`SELECT Id, Email, Rol FROM dbo.Usuarios WHERE Email = @emailParam AND Contrasena COLLATE Latin1_General_CI_AS = @passwordParam COLLATE Latin1_General_CI_AS`);
      //                                                                 ^
      //                                                                 ¡Aquí está la 'ñ' y el COLLATE!

    const user = result.recordset[0]; // Obtiene el primer registro que coincida

    if (user) {
      // Si se encontró un usuario con ese email y contraseña
      return NextResponse.json({ success: true, message: '¡Inicio de sesión exitoso!', user: { id: user.Id, email: user.Email, rol: user.Rol } }, { status: 200 });
    } else {
      // Si no se encontró el usuario o la contraseña no coincide
      return NextResponse.json({ success: false, message: 'Correo o contraseña inválidos.' }, { status: 401 });
    }

  } catch (err: any) {
    // Captura cualquier error que ocurra durante la conexión o la consulta a la base de datos
    console.error('Error durante el proceso de login:', err.message); // Imprime el mensaje de error en la terminal
    console.error('Detalles del error (stack trace):', err); // Imprime los detalles completos del error para depuración
    // Devolvemos un mensaje genérico por seguridad al frontend.
    return NextResponse.json({ success: false, message: 'Error interno del servidor. Inténtalo de nuevo más tarde.' }, { status: 500 });
  } finally {
    // Asegúrate de cerrar la conexión a la base de datos para liberar recursos.
    if (pool) {
      await pool.close();
    }
  }
}
