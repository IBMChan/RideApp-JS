import Ride from '../../entities/rides-schema.js';

export const findRidesByRiderId = async (riderId) => {
    try {
        const rides = await Ride.find({ rider_id: riderId });
        return rides;
    } catch (error) {
        throw new Error('Error fetching rides from database.');
    }
};