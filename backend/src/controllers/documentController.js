const { query } = require('../config/db');
const path = require('path');

const getDocuments = async (req, res, next) => {
  try {
    const { client_id, category } = req.query;
    let sql = `SELECT d.*, u.name as uploaded_by_name, c.name as client_name
               FROM documents d
               LEFT JOIN users u ON d.uploaded_by = u.id
               LEFT JOIN clients c ON d.client_id = c.id
               WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (client_id) { sql += ` AND d.client_id = $${idx}`; params.push(client_id); idx++; }
    if (category) { sql += ` AND d.category = $${idx}`; params.push(category); idx++; }

    sql += ' ORDER BY d.created_at DESC';
    const result = await query(sql, params);
    res.json({ documents: result.rows });
  } catch (err) {
    next(err);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    const { client_id, category = 'general', tags } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    if (!client_id) return res.status(400).json({ error: 'client_id is required' });

    // Mock AI text extraction
    const extractedText = `[Document content extracted from ${file.originalname}. This would contain the full text extracted by AI OCR/parsing in production.]`;
    const summary = `AI-generated summary of ${file.originalname}: This ${category} document contains important financial information relevant to the client's wealth management strategy.`;

    const result = await query(
      `INSERT INTO documents (client_id, uploaded_by, name, file_path, file_type, file_size, category, extracted_text, summary, tags, is_processed)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true) RETURNING *`,
      [
        client_id, req.user.id, file.originalname,
        file.path, file.mimetype, file.size,
        category, extractedText, summary,
        tags ? JSON.parse(tags) : [],
      ]
    );

    res.status(201).json({ document: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM documents WHERE id = $1 RETURNING id', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Document not found' });
    res.json({ message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDocuments, uploadDocument, deleteDocument };
