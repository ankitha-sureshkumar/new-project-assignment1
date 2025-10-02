const express = require('express');
const router = express.Router();
const { getPets, addPet, updatePet, deletePet } = require('../controllers/petController');

router.get('/', getPets);
router.post('/', addPet);
router.put('/:id', updatePet);
router.delete('/:id', deletePet);

module.exports = router;
