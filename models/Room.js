const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    maxOccupant: {
        type: Number,
        required: true
    },
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

RoomSchema.virtual('bookings', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'room',
    justOne: false
});

module.exports = mongoose.model('Room', RoomSchema);