const { json } = require('express')
const db = require('../services/db')

exports.getAllCategory = async (req, res) => {
  try {
    const result = await db.pool.query('SELECT * FROM category')
    return res.status(200).json(result.rows.map(row => ({
      ...row,
      created_date: row.created_date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
      updated_date: row.updated_date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    })))
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.createCategory = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(422).json({ error: 'nama belum terisi' })
    }
    const existsResult = await db.pool.query({
      text: 'SELECT EXISTS (SELECT * FROM category WHERE name = $1)',
      values: [req.body.name]
    })
    if (existsResult.rows[0].exists) {
      return res.status(409).json({ error: `peringatan!! category ${req.body.name} sudah ada !!` })
    }
    const result = await db.pool.query({
      text: 'INSERT INTO category (name, created_date, updated_date) VALUES($1, current_timestamp AT TIME ZONE \'Asia/Jakarta\', current_timestamp AT TIME ZONE \'Asia/Jakarta\') RETURNING *',
      values: [req.body.name]
    })
    return res.status(201).json(result.rows[0])
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.updateCategory = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(422).json({ error: 'nama belum terisi' })
    } else {
      const existsResult = await db.pool.query({
        text: 'SELECT EXISTS (SELECT * FROM category WHERE name = $1)',
        values: [req.body.name]
      })
      if (existsResult.rows[0].exists) {
        return res.status(409).json({ error: `peringatan!! category ${req.body.name} sudah ada !!` })
      }
      const result = await db.pool.query({
        text: 'UPDATE category SET name=$1, updated_date = current_timestamp AT TIME ZONE \'Asia/Jakarta\' WHERE id=$2 RETURNING *',
        values: [req.body.name, req.params.id]
      })
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'maaf category tidak ditemukan' })
      }
      return res.status(201).json(result.rows[0])
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.deleteCategory = async (req, res) => {
  try {
    const countResult = await db.pool.query({
      text: 'SELECT COUNT(*) FROM product WHERE category_id = $1',
      values: [req.params.id]
    })
    if (countResult.rows[0].count > 0) {
      return res.status(409).json({ error: `Category sudah terpakai pada ${countResult.rows[0].count} product(s)` })
    }
    const result = await db.pool.query({
      text: 'DELETE FROM category WHERE id=$1',
      values: [req.params.id]
    })
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'maaf category tidak ditemukan' })
    }
    return res.status(201).json(result.rows[0])
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}