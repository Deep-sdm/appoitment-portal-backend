const express = require('express');
const {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus
} = require('../controllers/appointment.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // All appointment routes require authentication

router.post('/', createAppointment);
router.get('/', getMyAppointments);
router.get('/:id', getAppointmentById);
router.patch('/:id/status', updateAppointmentStatus);

module.exports = router;
