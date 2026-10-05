import React, { createContext, useContext, useState } from 'react';
const BookingContext = createContext(undefined);
export function BookingProvider({ children }) {
    const [searchParams, setSearchParamsState] = useState(null);
    const [selectedTrain, setSelectedTrainState] = useState(null);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedCoach, setSelectedCoach] = useState('');
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [passengers, setPassengers] = useState([]);
    const [fareBreakdown, setFareBreakdown] = useState(null);
    const setSearchParams = (params) => setSearchParamsState(params);
    const setSelectedTrain = (train) => setSelectedTrainState(train);
    const addSeat = (seat) => {
        setSelectedSeats(prev => [...prev, seat]);
    };
    const removeSeat = (seatNumber) => {
        setSelectedSeats(prev => prev.filter(s => s.number !== seatNumber));
    };
    const addPassenger = (passenger) => {
        setPassengers(prev => [...prev, passenger]);
    };
    const removePassenger = (id) => {
        setPassengers(prev => prev.filter(p => p.id !== id));
    };
    const updatePassenger = (id, data) => {
        setPassengers(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    };
    const calculateFare = () => {
        if (!selectedTrain || passengers.length === 0)
            return;
        // Mock calculation
        const count = passengers.length;
        const base = count * 850;
        setFareBreakdown({
            baseFare: base,
            reservationCharge: count * 40,
            superfastCharge: count * 30,
            gst: base * 0.05,
            totalAmount: base + (count * 70) + (base * 0.05)
        });
    };
    const resetBooking = () => {
        setSelectedTrainState(null);
        setSelectedClass('');
        setSelectedCoach('');
        setSelectedSeats([]);
        setPassengers([]);
        setFareBreakdown(null);
    };
    const value = {
        searchParams,
        selectedTrain,
        selectedClass,
        selectedCoach,
        selectedSeats,
        passengers,
        fareBreakdown,
        setSearchParams,
        setSelectedTrain,
        setSelectedClass,
        setSelectedCoach,
        addSeat,
        removeSeat,
        addPassenger,
        removePassenger,
        updatePassenger,
        calculateFare,
        resetBooking
    };
    return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
export const useBooking = () => {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};
