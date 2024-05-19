//módulos necesarios
const express = require('express');
const { consultarUsuarios, registrarUsuario, actualizarUsuario, eliminarUsuario, registrarTransferencia, consultarTransferencias, getUserData, updateBalance } = require('./consultas');

//crear una instancia de la aplicación Express
const app = express();

//configurar el puerto del servidor
const port = 3000;

//middleware para analizar el cuerpo de las solicitudes JSON
app.use(express.json());

//ruta para servir la página HTML principal
app.use(express.static('public'));

//ruta para obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await consultarUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios de la base de datos' });
  }
});

//ruta para registrar un nuevo usuario
app.post('/usuario', async (req, res) => {
  const { nombre, balance } = req.body;
  if (!nombre || !balance) {
    return res.status(400).json({ error: 'Por favor proporcione un nombre y un balance para el nuevo usuario' });
  }

  try {
    await registrarUsuario(nombre, balance);
    res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el usuario en la base de datos' });
  }
});

//ruta para actualizar un usuario existente
app.put('/usuario/', async (req, res) => {
  const {id, nombre, balance } = req.body;
  console.log("editar")
  if (!nombre || !balance) {
    return res.status(400).json({ error: 'Por favor proporcione un nombre y un balance para actualizar el usuario' });
  }

  try {
    await actualizarUsuario(id, nombre, balance);
    res.status(200).json({ mensaje: 'Usuario actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el usuario en la base de datos' });
  }
});

//ruta para eliminar un usuario existente
app.delete('/usuario/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await eliminarUsuario(id);
    res.status(200).json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario de la base de datos' });
  }
});

//ruta para realizar una transferencia
app.post("/transferencia", async (req, res) => {
    try {
        const { emisor, receptor, monto } = req.body;

        if (!emisor || !receptor || isNaN(monto) || monto <= 0) {
            throw new Error('Los datos de entrada son inválidos');
        }

        const emisorData = await getUserData(emisor);
        const receptorData = await getUserData(receptor);
        const emisorId = emisorData.id;
        const receptorId = receptorData.id;
        const saldoEmisor = parseFloat(emisorData.balance);
        const saldoReceptor = parseFloat(receptorData.balance);

        if (saldoEmisor < monto) {
            throw new Error('Saldo insuficiente para realizar la transferencia');
        }
        const nuevoSaldoEmisor = saldoEmisor - parseFloat(monto);
        const nuevoSaldoReceptor = saldoReceptor + parseFloat(monto);

        await updateBalance(emisorId, nuevoSaldoEmisor);
        await updateBalance(receptorId, nuevoSaldoReceptor);

        const fecha = new Date();
        const transferenciaResult = await registrarTransferencia(emisorId, receptorId, parseFloat(monto), fecha);

        res.status(200).send(transferenciaResult.rows[0]);
    } catch (error) {
        
        res.status(500).send(error.message || "Error 500");
    }
});

//ruta para obtener todas las transferencias
app.get('/transferencias', async (req, res) => {
  try {
    const transferencias = await consultarTransferencias();
    res.status(200).json(transferencias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las transferencias de la base de datos' });
  }
});


//iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});
