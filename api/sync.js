const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT oficina, facilitadores, papelera, movimientos, usuarios FROM sistema_inventario WHERE id = 1');
            client.release();
            
            if (result.rows.length > 0) {
                res.status(200).json(result.rows[0]);
            } else {
                res.status(200).json({ 
                    oficina: {}, 
                    facilitadores: [], 
                    papelera: { productos: {}, facilitadores: [] },
                    movimientos: [],
                    usuarios: [{ user: "admin", pass: "123", rol: "admin" }]
                });
            }
        } catch (err) {
            console.error("Error leyendo BD:", err);
            res.status(500).json({ error: 'Error leyendo la base de datos' });
        }
    } 
    else if (req.method === 'POST') {
        try {
            const { oficina, facilitadores, papelera, movimientos, usuarios } = req.body;
            const client = await pool.connect();
            
            await client.query(`
                INSERT INTO sistema_inventario (id, oficina, facilitadores, papelera, movimientos, usuarios)
                VALUES (1, $1, $2, $3, $4, $5)
                ON CONFLICT (id) DO UPDATE 
                SET oficina = EXCLUDED.oficina, 
                    facilitadores = EXCLUDED.facilitadores, 
                    papelera = EXCLUDED.papelera,
                    movimientos = EXCLUDED.movimientos,
                    usuarios = EXCLUDED.usuarios;
            `, [
                JSON.stringify(oficina || {}), 
                JSON.stringify(facilitadores || []), 
                JSON.stringify(papelera || {productos:{}, facilitadores:[]}),
                JSON.stringify(movimientos || []),
                JSON.stringify(usuarios || [{ user: "admin", pass: "123", rol: "admin" }])
            ]);
            
            client.release();
            res.status(200).json({ message: 'Datos guardados en la nube' });
        } catch (err) {
            console.error("Error escribiendo BD:", err);
            res.status(500).json({ error: 'Error guardando en la base de datos' });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}
