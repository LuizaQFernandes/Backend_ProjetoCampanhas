// API REST dos campanhas
import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const tituloCollection = 'campanhas'
const { db, ObjectId } = await connectToDatabase()

const validaCampanha = [
  check('titulo', 'Título da Campanha Solidária é obrigatório').not().isEmpty(),
  check('endereco', 'É obrigatório informar o endereço da campanha').not().isEmpty(),
  check('categoria', 'A categoria deve ser: Alimentos, Brinquedos, Livros, Escolar, Roupas, Eletrônicos, Limpeza, Higiene, Dinheiro, Outro').isIn(['Alimentos', 'Brinquedos', 'Livros', 'Escolar', 'Roupas', 'Eletrônicos', 'Limpeza', 'Higiene',  'Dinheiro', 'Outro']),
  check('dataInicio', 'A data de Início deve ser inserida').not().isEmpty(),
  check('dataTermino', 'A data de Término deve ser inserida').not().isEmpty(),
  check('voluntarios', 'É obrigatório informar se a campanha aceita cadastro de voluntários (Sim / Não)').isIn(['Sim', 'Não']),
]

/**********************************************
 * GET /campanhas/
 * Lista todos os campanhas
 **********************************************/
router.get("/", async (req, res) => {
  try {
    db.collection(tituloCollection).find({}).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna os documentos
      }
    })
  } catch (err) {
    res.status(500).json({ "error": err.message })
  }
})

/**********************************************
 * GET /campanhas/:titulo
 * Lista a campanha pelo titulo
 **********************************************/
router.get("/:titulo", async (req, res) => {
  try {
    db.collection(tituloCollection).find({ "titulo": { $eq: req.params.titulo } }).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna o documento
      }
    })
  } catch (err) {
    res.status(500).json({ "error": err.message })
  }
})

/**********************************************
 * GET /campanhas/titulo/:titulo
 * Lista o campanha através de parte do seu titulo
 **********************************************/
router.get("/titulo/:titulo", async (req, res) => {

    try {
      db.collection(tituloCollection).find({ titulo: {$regex: req.params.titulo, $options: "i"} }).toArray((err, docs) => {
        if (err) {
          res.status(400).json(err) //bad request
        } else {
          res.status(200).json(docs) //retorna o documento
        }
      })
    } catch (err) {
      res.status(500).json({ "error": err.message })
    }
  })

/**********************************************
 * POST /campanhas/
 * Inclui nova campanha
 **********************************************/
router.post('/', validaCampanha, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json(({
      errors: errors.array()
    }))
  } else {
    await db.collection(tituloCollection)
      .insertOne(req.body)
      .then(result => res.status(201).send(result)) //retorna o titulo do documento inserido)
      .catch(err => res.status(400).json(err))
  }
})

/**********************************************
 * PUT /campanhas/
 * Altera campanha pelo título
 **********************************************/
router.put('/', validaCampanha, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json(({
      errors: errors.array()
    }))
  } else {
    const campanhaInput = req.body
    await db.collection(tituloCollection)
      .updateOne({ "titulo": { $eq: req.body.titulo} }, {
        $set:
        {
          titulo: campanhaInput.titulo,
          sobre: campanhaInput.sobre,
          dataInicio: campanhaInput.dataInicio,
          dataTermino: campanhaInput.dataTermino,
          endereco: campanhaInput.endereco,
          categoria: campanhaInput.categoria,
          observacoes: campanhaInput.observacoes,
          linkFoto: campanhaInput.linkFoto,
          numero: campanhaInput.numero,
          voluntarios: campanhaInput.voluntarios,
          descricaoAtividades: campanhaInput.descricaoAtividades,

        }
      },
        { returnNewDocument: true })
      .then(result => res.status(202).send(result))
      .catch(err => res.status(400).json(err))
  }
})

/**********************************************
 * DELETE /campanhas/
 * Apaga uma campanha pelo titulo
 **********************************************/
router.delete('/:titulo', async (req, res) => {
  await db.collection(tituloCollection)
    .deleteOne({ "titulo": { $eq: req.params.titulo } })
    .then(result => res.status(202).send(result))
    .catch(err => res.status(400).json(err))
})

export default router