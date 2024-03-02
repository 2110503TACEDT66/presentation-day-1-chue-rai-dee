const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');

//@desc Get all bookings
//@route GET /api/v1/bookings
//@access Public
exports.getBookings = async (req, res, next) => {
    let query;
    //General users can see only their bookings!
    if(req.user.role !== 'admin'){
        query = Booking.find({ user: req.user.id }).populate({
            path: 'hotel',
            select: 'name province tel'
        });
    } else { //If you are an admin, you can see all!
        if(req.params.hotelId){
            console.log(req.params.hotelId);
            query = Booking.find({ hotel: req.params.hotelId }).populate({
                path: 'hotel',
                select: 'name province tel'
            });
        }else{
            query = Booking.find().populate({
                path: 'hotel',
                select: 'name province tel'
            });
        }
    }
    try{
        const bookings = await query;
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message : "Cannot find Booking" });
    }
};

//@desc Get single booking
//@route GET /api/v1/bookings/:id
//@access Public
exports.getBooking = async (req, res, next) => {
    try{
        const booking = await Booking.findById(req.params.id).populate({
            path: 'hotel',
            select: 'name province tel'
        });
        if(!booking){
            return res.status(404).json({ success: false , message: `No booking with the id of ${req.params.id}`});
        }
        res.status(200).json({ success: true, data: booking });
    }catch(err){
        console.log(err.stack);
        res.status(500).json({ success: false, message: "Cannot find booking" });
    }
}

//@desc Add booking
//@route POST /api/v1/hotels/:hotelId/bookings
//@access Private
exports.addBooking = async (req, res, next) => {
    try{
        req.body.hotel = req.params.hotelId;

        //add user to req.body
        req.body.user = req.user.id;

        //check for existed booking
        const existedBookings = await Booking.find({ user: req.user.id });
        let nights=0;

        existedBookings.forEach(booking => {
            if(booking.bookingend > Date.now()){
                console.log(booking.bookingend);
                nights += (booking.bookingend - booking.bookingbegin) / (1000 * 60 * 60 * 24);
            }
        });
       
        //console.log(nights)
        if(nights >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({ success: false, message: `The user with ID ${req.user.id} cannot make booking with more than 3 nights` });
        }
        
        const existingBooking = await Booking.findOne({
            room: req.body.room,
            $or: [
                { bookingbegin: { $lte: req.body.bookingbegin }, bookingend: { $gte: req.body.bookingbegin } },
                { bookingbegin: { $lte: req.body.bookingend }, bookingend: { $gte: req.body.bookingend } },
                { bookingbegin: { $gte: req.body.bookingbegin }, bookingend: { $lte: req.body.bookingend } }
            ]
        });

        if (existingBooking) {
            return res.status(400).json({ success: false, message: 'The room is not available on the specified dates' });
        }

        //console.log(req.params.hotelId);
        const hotel = await Hotel.findById(req.params.hotelId);
        if(!hotel){
            return res.status(404).json({ success: false, message: `No hotel with the id of ${req.params.hotelId}`});
        }

        const room = await Room.findById(req.body.room);

        if(!room){
            return res.status(404).json({ success: false, message: `No room with the id of ${req.params.roomId}`});
        }

        if (room.hotel.toString() !== req.params.hotelId) {
            return res.status(400).json({ success: false, message: 'The specified room does not in the specified hotel' });
        }

        const booking = await Booking.create(req.body);
        res.status(200).json({ success: true, data: booking });
    } catch (error){
        console.log(error.stack);
        res.status(500).json({ success: false, message: "Cannot add booking" });
    }
}

//@desc Update booking
//@route PUT /api/v1/bookings/:id
//@access Private
exports.updateBooking = async (req, res, next) => {
    try{
        let booking = await Booking.findById(req.params.id);
        if(!booking){
            return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}`});
        }

        //Make sure the user is the owner of the booking
        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to update this booking` });
        }

        //check for existed booking
        const existedBookings = await Booking.find({ user: req.user.id });

        let nights=0;
        existedBookings.forEach(booking => {
            if(booking.bookingend < Date.now()){
                nights += (booking.bookingend - booking.bookingbegin) / (1000 * 60 * 60 * 24);
            }
        });
        
        console.log(nights)
        if(nights >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({ success: false, message: `The user with ID ${req.user.id} cannot make booking with more than 3 nights` });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({ success: true, data: booking });
    }catch(err){
        console.log(err.stack);
        res.status(500).json({ success: false, message: "Cannot update booking" });
    }
}

//@desc Delete booking
//@route DELETE /api/v1/bookings/:id
//@access Private
exports.deleteBooking = async (req, res, next) => {
    try{
        const booking = await Booking.findById(req.params.id);
        if(!booking){
            return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}`});
        }

        //Make sure the user is the owner of the booking
        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to delete this booking` });
        }

        await booking.deleteOne();
        res.status(200).json({ success: true, data: {} });
    }catch(err){
        console.log(err.stack);
        res.status(500).json({ success: false, message: "Cannot delete booking" });
    }
}