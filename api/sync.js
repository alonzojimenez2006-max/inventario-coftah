const { Pool } = require('pg');

// Conexión a la base de datos de Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Usamos module.exports en lugar de export default para evitar conflictos de sintaxis
module.exports = async function(req, res) {
  try {
    if (req.method === 'GET') {
      // Lee los datos de Neon al abrir la página
      const result = await pool.query('SELECT * FROM sistema_inventario WHERE id = 1');
      res.status(200).json(result.rows[0]);
    } 
    else if (req.method === 'POST') {
      // Guarda los datos en Neon cada vez que haces un cambio
      const { oficina, facilitadores, papelera } = req.body;
      
      // Aseguramos que los objetos viajen como JSON String a la base de datos
      await pool.query(
        'UPDATE sistema_inventario SET oficina = $1, facilitadores = $2, papelera = $3 WHERE id = 1',
        [JSON.stringify(oficina), JSON.stringify(facilitadores), JSON.stringify(papelera)]
      );
      
      res.status(200).json({ success: true });
    } 
    else {
      res.status(405).json({ message: 'Método no permitido' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};