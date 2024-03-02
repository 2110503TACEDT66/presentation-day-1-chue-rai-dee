const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

//@desc Get all rooms
//@route GET /api/v1/rooms
//@access Public
exports.getRooms = async (req, res, next) => {
    try {
        const rooms = await Room.find();
        res.status(200).json({ success: true, count: rooms.length, data: rooms });
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}

//@desc Get single room
//@route GET /api/v1/rooms/:id
//@access Public
exports.getRoom = async (req, res, next) => {
    try{
        const room = await Room.findById(req.params.id);
        if(!room){
            return res.status(400).json({ success: false, message: `No room with the ID of ${req.param.id}` });
        }
        res.status(200).json({ success: true, data: room });
    }catch (err){
        res.status(400).json({ success: false });
    }
}

//@desc Create new room
//@route POST /api/v1/hotels/:hotelId/rooms
//@access Private
exports.createRoom = async (req, res, next) => {
    try{
        req.body.hotel = req.params.hotelId
        const hotel = await Hotel.findById(req.params.hotelId);
        if(!hotel){
            return res.status(404).json({ success: false, message: `No hotel with the id of ${req.params.hotelId}`});
        }

        const room = await Room.create(req.body);
        res.status(201).json({
            success: true,
            data: room
        });
    } catch (err){
        console.log(err.stack);
        res.status(400).json({ success: false });
    }
}

//@desc Update room
//@route PUT /api/v1/rooms/:id
//@access Private
exports.updateRoom = async (req, res, next) => {
    try{
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!room){
            return res.status(400).json({ success: false, message: `No room with the ID of ${req.param.id}` });
        }

        res.status(200).json({ success: true, data: room });
    }catch (err){
        res.status(400).json({ success: false });
    }
}

//@desc Delete room
//@route DELETE /api/v1/rooms/:id
//@access Private
exports.deleteRoom = async (req, res, next) => {
    try{
        const room = await Room.findById(req.params.id);
        if(!room){
            return res.status(400).json({ success: false, message: `No room with the ID of ${req.param.id}` });
        }
        await room.deleteOne();
        res.status(200).json({ success: true, data: {} });
    }catch(err){
        res.status(400).json({ success: false });
    }
}