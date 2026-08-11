const express = require('express');
const { getDoctors, getDoctorById, createDoctor } = require('../controllers/doctor.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/', protect, createDoctor);

module.exports = router;
