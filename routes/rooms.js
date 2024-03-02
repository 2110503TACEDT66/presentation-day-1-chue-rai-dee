const express = require('express');
const {getRooms,getRoom,createRoom,updateRoom,deleteRoom} = require('../controllers/rooms');

// Include other resource routers
const bookingRouter = require('./bookings');

const router = express.Router({mergeParams: true});

const {protect, authorize} = require('../middleware/auth');

//Re-route into other resource routers
//router.use('/:roomId/booking', bookingRouter);

router.route('/').get(getRooms).post(protect, authorize('admin'), createRoom);
router.route('/:id').get(getRoom).put(protect, authorize('admin'), updateRoom).delete(protect, authorize('admin'), deleteRoom);

module.exports = router;