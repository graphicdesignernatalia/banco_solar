//importar el módulo pg para conectarse a PostgreSQL
const { Pool } = require('pg');

//configuración de la conexión a la base de datos PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'bancosolar',
  password: 'Theshowmustgoon82',
  port: 5432,
});

//función para consultar todos los usuarios
const consultarUsuarios = async () => {
  const consulta = "SELECT * FROM usuarios";
  const { rows } = await pool.query(consulta);
  return rows;
};

//función para registrar un nuevo usuario
const registrarUsuario = async (nombre, balance) => {
  const consulta = "INSERT INTO usuarios (nombre, balance) VALUES ($1, $2)";
  await pool.query(consulta, [nombre, balance]);
};

//función para actualizar un usuario existente
const actualizarUsuario = async (id, nombre, balance) => {
  const consulta = "UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = $3";
  await pool.query(consulta, [nombre, balance, id]);
};

//función para eliminar un usuario existente
const eliminarUsuario = async (id) => {
  const consulta = "DELETE FROM usuarios WHERE id = $1";
  await pool.query(consulta, [id]);
};

//función para realizar una transferencia entre usuarios
const registrarTransferencia = async (emisorId, receptorId, monto, fecha) => {
  try {
    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
  }
  
  return await pool.query('INSERT INTO transferencias(emisor, receptor, monto, fecha) VALUES($1, $2, $3, $4) RETURNING *', [emisorId, receptorId, monto, fecha]);
}

const updateBalance = async (userId, newBalance) => {
  await pool.query('UPDATE usuarios SET balance = $1 WHERE id = $2', [newBalance, userId]);
}

const getUserData = async (nombre) => {
  await pool.query("BEGIN");
  const userData = await pool.query('SELECT id, balance FROM usuarios WHERE nombre = $1', [nombre]);
  if (userData.rows.length === 0) {
      throw new Error('El usuario "${nombre}" no existe en la base de datos');
  }
  return userData.rows[0];
}

//función para consultar todas las transferencias
const consultarTransferencias = async () => {
  const consulta = "SELECT * FROM transferencias";
  const { rows } = await pool.query(consulta);
  return rows;
};

module.exports = {
  consultarUsuarios,
  registrarUsuario,
  actualizarUsuario,
  eliminarUsuario,
  registrarTransferencia,
  consultarTransferencias,
  updateBalance,
  getUserData,
  query: (text, params) => pool.query(text, params),
};

