// studio/src/app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
import sql from 'mssql';


const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true // Para desarrollo; en producción, deberías tener un certificado de confianza.
  }
};

export async function POST(req: Request) {
  const { cedula, nombre, apellido, email, password } = await req.json();

  // Validación básica: asegura que todos los campos requeridos estén presentes
  if (!cedula || !nombre || !apellido || !email || !password) {
    return NextResponse.json({ success: false, message: 'Todos los campos obligatorios deben ser completados.' }, { status: 400 });
  }

  let pool; // Declaramos la variable 'pool' para asegurar que se cierre la conexión
  try {
    pool = await sql.connect(config);

    // -- ¡¡ADVERTENCIA DE SEGURIDAD CRÍTICA!! --
    // Este código guarda la contraseña en texto plano.
    // EN UN ENTORNO DE PRODUCCIÓN REAL, DEBES HASHEAR LA CONTRASEÑA antes de guardarla.
    // Para ello, primero instala bcryptjs: npm install bcryptjs
    // Luego, en este archivo, importar: import bcrypt from 'bcryptjs';
    // Y usarlo: const hashedPassword = await bcrypt.hash(password, 10);
    // Finalmente, inserta 'hashedPassword' en lugar de 'password'.
    // -- ¡¡FIN ADVERTENCIA!! --

    // Paso 1: Verificar si el email o la cédula ya existen en la base de datos
    const checkUser = await pool.request()
      .input('emailCheck', sql.NVarChar, email)
      .input('cedulaCheck', sql.Int, cedula)
      .query(`SELECT Id FROM dbo.Usuarios WHERE Email = @emailCheck OR Cedula = @cedulaCheck`);

    if (checkUser.recordset.length > 0) {
      // Si ya existe un usuario con ese email o cédula, devolvemos un error 409 Conflict
      return NextResponse.json({ success: false, message: 'El correo electrónico o la cédula ya están registrados. Por favor, utiliza otro.' }, { status: 409 });
    }

    // Paso 2: Insertar el nuevo usuario en la base de datos
    // Asegúrate de que los nombres de las columnas aquí coinciden EXACTAMENTE
    // con los nombres en tu tabla dbo.Usuarios.
    const result = await pool.request()
      .input('cedula', sql.Int, cedula)
      .input('nombre', sql.NVarChar, nombre)
      .input('apellido', sql.NVarChar, apellido)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, password) // Aquí irá el HASHED_PASSWORD si implementas bcrypt
      .input('rol', sql.NVarChar, 'Paciente') // Asigna un rol predeterminado, puedes cambiarlo
      .input('estatus', sql.Bit, 1) // Estatus por defecto (ej. 1 para activo)

      // La columna FechaRegistro es datetime, null en tu BD, así que la BD puede asignarla
      // automáticamente (si tiene un valor por defecto) o puedes usar GETDATE() en la consulta SQL.
      // Si necesitas enviarla desde aquí, sería: .input('fechaRegistro', sql.DateTime, new Date())
      .query(`
        INSERT INTO dbo.Usuarios (Cedula, Nombre, Apellido, Email, Contrasena, Rol, Estatus)
        VALUES (@cedula, @nombre, @apellido, @email, @password, @rol, @estatus)
      `);

    // Verifica si la inserción afectó al menos una fila
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return NextResponse.json({ success: true, message: '¡Usuario registrado exitosamente! Ya puedes iniciar sesión.' }, { status: 201 }); // 201 Created
    } else {
      // Si por alguna razón no se insertó ninguna fila, aunque no hubo error
      return NextResponse.json({ success: false, message: 'No se pudo registrar el usuario. Inténtalo de nuevo.' }, { status: 500 });
    }

  } catch (err: any) {
    console.error('Error durante el proceso de registro de usuario:', err.message);
    console.error('Detalles completos del error (stack trace):', err); // Esto es útil para depurar
    // Mensaje de error genérico al usuario final por seguridad
    return NextResponse.json({ success: false, message: 'Error interno del servidor al registrar. Por favor, intenta de nuevo más tarde.' }, { status: 500 });
  } finally {
    // Asegúrate de que la conexión a la base de datos se cierre siempre
    if (pool) {
      await pool.close();
    }
  }
}