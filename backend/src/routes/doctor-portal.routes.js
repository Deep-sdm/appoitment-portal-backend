const express = require('express');
const {
  getDoctorDashboardStats,
  getDoctorAppointments,
  updateAppointmentDetails,
  addDoctorHoliday,
  removeDoctorHoliday
} = require('../controllers/doctor-portal.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/stats', getDoctorDashboardStats);
router.get('/appointments', getDoctorAppointments);
router.patch('/appointment/:id', updateAppointmentDetails);
router.post('/holiday', addDoctorHoliday);
router.delete('/holiday/:date', removeDoctorHoliday);

module.exports = router;
