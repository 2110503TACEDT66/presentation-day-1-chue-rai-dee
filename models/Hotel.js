const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    district: {
        type: String,
        required: [true, 'Please add a district']
    },
    province: {
        type: String,
        required: [true, 'Please add a province']
    },
    postalcode: {
        type: String,
        required: [true, 'Please add a postal code'],
        maxlength: [5, 'Postal code cannot be more than 5 digits']
    },
    tel:{
        type: String
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

//TODO 
// Cascade delete bookings when a hotel is deleted
HotelSchema.pre('deleteOne',{document: true, query: false}, async function(next) {
    console.log(`bookings being removed from hotel ${this._id}`);
    await this.model('booking').deleteMany({ hotel: this._id });
    next();
});

// Reverse populate with virtuals
HotelSchema.virtual('bookings', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'hotel',
    justOne: false
});
module.exports = mongoose.model('Hotel', HotelSchema);