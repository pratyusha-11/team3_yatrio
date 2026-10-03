
import { useState } from 'react'

const initialPassenger = {
  name: '',
  age: '',
  gender: '',
  seatPreference: 'No Preference',
  mealPreference: 'No Preference',
}

function Booking() {
  const [step, setStep] = useState(1)

  const [passengers, setPassengers] = useState([
    { ...initialPassenger },
  ])

  const [contact, setContact] = useState({
    mobile: '',
    email: '',
  })

  const [bookingId, setBookingId] = useState('')

  const train = {
    name: 'Yatrio Express',
    number: 'YTR-1205',
    from: 'Pune',
    to: 'Mumbai',
    date: '05 October 2026',
    departure: '08:30 AM',
    arrival: '12:15 PM',
    fare: 800,
  }

  const reservationCharge = 40
  const serviceCharge = 20

  const totalFare =
    passengers.length * train.fare +
    reservationCharge +
    serviceCharge

  const updatePassenger = (index, field, value) => {
    setPassengers((current) =>
      current.map((passenger, i) =>
        i === index
          ? { ...passenger, [field]: value }
          : passenger,
      ),
    )
  }

  const addPassenger = () => {
    setPassengers((current) => [
      ...current,
      { ...initialPassenger },
    ])
  }

  const removePassenger = (index) => {
    if (passengers.length === 1) return

    setPassengers((current) =>
      current.filter((_, i) => i !== index),
    )
  }

  const updateContact = (field, value) => {
    setContact((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const continueToReview = () => {
    const validPassengers = passengers.every(
      (passenger) =>
        passenger.name.trim() &&
        passenger.age &&
        passenger.gender,
    )

    if (!validPassengers) {
      alert('Please complete all required passenger details.')
      return
    }

    if (!contact.mobile.trim() || !contact.email.trim()) {
      alert('Please enter mobile number and email address.')
      return
    }

    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const confirmBooking = () => {
    const id = `YTR${Math.floor(100000 + Math.random() * 900000)}`
    setBookingId(id)
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startNewBooking = () => {
    setPassengers([{ ...initialPassenger }])
    setContact({
      mobile: '',
      email: '',
    })
    setBookingId('')
    setStep(1)
  }

  return (
    <div className="min-h-screen bg-ink font-display text-white">
      {/* Top brand line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-royal via-azure to-sky" />

      {/* Header */}
      <header className="border-b border-white/10 bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xl font-bold tracking-tight">
              Yatrio
            </p>
            <p className="text-xs text-white/50">
              Railway Booking
            </p>
          </div>

          <div className="hidden text-sm text-white/60 sm:block">
            Booking & Passenger Management
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Page heading */}
        <section className="mb-8">
          <p className="mb-2 text-xs font-bold tracking-[0.2em] text-azure">
            RAILWAY BOOKING
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Book your journey
            <span className="text-azure"> with Yatrio.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
            Enter passenger details, select preferences and
            review your journey before confirming the booking.
          </p>
        </section>

        {/* Progress */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2">

          <div
            className={`flex shrink-0 items-center gap-2 ${
              step >= 1 ? 'text-white' : 'text-white/40'
            }`}
          >
            <span
              className={`flex size-8 items-center justify-center rounded-full text-sm font-bold ${
                step >= 1
                  ? 'bg-azure text-ink'
                  : 'bg-white/10'
              }`}
            >
              1
            </span>
            <span className="text-sm font-semibold">
              Passenger Details
            </span>
          </div>

          <div className="h-px w-12 bg-white/15" />

          <div
            className={`flex shrink-0 items-center gap-2 ${
              step >= 2 ? 'text-white' : 'text-white/40'
            }`}
          >
            <span
              className={`flex size-8 items-center justify-center rounded-full text-sm font-bold ${
                step >= 2
                  ? 'bg-azure text-ink'
                  : 'bg-white/10'
              }`}
            >
              2
            </span>
            <span className="text-sm font-semibold">
              Review
            </span>
          </div>

          <div className="h-px w-12 bg-white/15" />

          <div
            className={`flex shrink-0 items-center gap-2 ${
              step >= 3 ? 'text-white' : 'text-white/40'
            }`}
          >
            <span
              className={`flex size-8 items-center justify-center rounded-full text-sm font-bold ${
                step >= 3
                  ? 'bg-status-success text-ink'
                  : 'bg-white/10'
              }`}
            >
              3
            </span>
            <span className="text-sm font-semibold">
              Confirmation
            </span>
          </div>

        </div>

        {/* Train card */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">

          <div className="grid gap-6 md:grid-cols-3 md:items-center">

            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] text-white/40">
                TRAIN
              </p>

              <h2 className="mt-1 text-xl font-bold">
                {train.name}
              </h2>

              <p className="mt-1 text-sm text-white/50">
                {train.number}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">

              <div>
                <p className="text-xl font-bold">
                  {train.from}
                </p>
                <p className="text-xs text-white/50">
                  {train.departure}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-azure" />
                <div className="h-px w-16 bg-white/20" />
                <span className="size-2 rounded-full bg-sky" />
              </div>

              <div>
                <p className="text-xl font-bold">
                  {train.to}
                </p>
                <p className="text-xs text-white/50">
                  {train.arrival}
                </p>
              </div>

            </div>

            <div className="md:text-right">
              <p className="text-[10px] font-bold tracking-[0.18em] text-white/40">
                JOURNEY DATE
              </p>

              <p className="mt-1 font-semibold">
                {train.date}
              </p>
            </div>

          </div>
        </section>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

            {/* Passenger form */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">

              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.18em] text-azure">
                    PASSENGERS
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Passenger Details
                  </h2>

                  <p className="mt-2 text-sm text-white/50">
                    Add details for every passenger travelling.
                  </p>
                </div>

                <span className="rounded-full bg-azure/10 px-3 py-1.5 text-xs font-semibold text-azure">
                  {passengers.length} Passenger
                  {passengers.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Passenger cards */}
              <div className="space-y-4">

                {passengers.map((passenger, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-white/10 bg-black/10 p-5"
                  >

                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="font-semibold">
                        Passenger {index + 1}
                      </h3>

                      {passengers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePassenger(index)}
                          className="text-xs font-semibold text-red-300 hover:text-red-200"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">

                      {/* Name */}
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-xs font-semibold text-white/60">
                          Full Name *
                        </label>

                        <input
                          type="text"
                          value={passenger.name}
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              'name',
                              e.target.value,
                            )
                          }
                          placeholder="Enter passenger name"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-azure"
                        />
                      </div>

                      {/* Age */}
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-white/60">
                          Age *
                        </label>

                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={passenger.age}
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              'age',
                              e.target.value,
                            )
                          }
                          placeholder="Age"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-azure"
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-white/60">
                          Gender *
                        </label>

                        <select
                          value={passenger.gender}
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              'gender',
                              e.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-azure"
                        >
                          <option value="" className="text-black">
                            Select gender
                          </option>
                          <option value="Male" className="text-black">
                            Male
                          </option>
                          <option value="Female" className="text-black">
                            Female
                          </option>
                          <option value="Other" className="text-black">
                            Other
                          </option>
                        </select>
                      </div>

                      {/* Seat */}
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-white/60">
                          Seat Preference
                        </label>

                        <select
                          value={passenger.seatPreference}
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              'seatPreference',
                              e.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-azure"
                        >
                          <option className="text-black">
                            No Preference
                          </option>
                          <option className="text-black">
                            Window
                          </option>
                          <option className="text-black">
                            Aisle
                          </option>
                          <option className="text-black">
                            Lower
                          </option>
                          <option className="text-black">
                            Upper
                          </option>
                        </select>
                      </div>

                      {/* Meal */}
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-white/60">
                          Meal Preference
                        </label>

                        <select
                          value={passenger.mealPreference}
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              'mealPreference',
                              e.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-azure"
                        >
                          <option className="text-black">
                            No Preference
                          </option>
                          <option className="text-black">
                            Vegetarian
                          </option>
                          <option className="text-black">
                            Non-Vegetarian
                          </option>
                        </select>
                      </div>

                    </div>
                  </div>
                ))}

              </div>

              {/* Add passenger */}
              <button
                type="button"
                onClick={addPassenger}
                className="mt-5 w-full rounded-lg border border-dashed border-azure/50 bg-azure/5 px-4 py-3 text-sm font-semibold text-azure transition hover:bg-azure/10"
              >
                + Add Another Passenger
              </button>

              {/* Contact */}
              <div className="mt-8 border-t border-white/10 pt-8">

                <p className="text-xs font-bold tracking-[0.18em] text-azure">
                  CONTACT
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Contact Information
                </h2>

                <p className="mt-2 text-sm text-white/50">
                  Booking updates will be sent to these details.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-white/60">
                      Mobile Number *
                    </label>

                    <input
                      type="tel"
                      value={contact.mobile}
                      onChange={(e) =>
                        updateContact('mobile', e.target.value)
                      }
                      placeholder="Enter mobile number"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-azure"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-white/60">
                      Email Address *
                    </label>

                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) =>
                        updateContact('email', e.target.value)
                      }
                      placeholder="Enter email address"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-azure"
                    />
                  </div>

                </div>
              </div>

              <div className="mt-7 flex justify-end">
                <button
                  type="button"
                  onClick={continueToReview}
                  className="rounded-lg bg-azure px-6 py-3 text-sm font-bold text-ink transition hover:bg-sky"
                >
                  Continue to Review →
                </button>
              </div>

            </section>

            {/* Fare */}
            <aside className="h-fit rounded-2xl border border-white/10 bg-white/5 p-6 lg:sticky lg:top-5">

              <p className="text-xs font-bold tracking-[0.18em] text-azure">
                FARE SUMMARY
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Booking Summary
              </h2>

              <div className="mt-6 space-y-4">

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-white/50">
                    Base Fare
                  </span>
                  <span className="font-semibold">
                    ₹{passengers.length * train.fare}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-white/50">
                    Reservation Charges
                  </span>
                  <span className="font-semibold">
                    ₹{reservationCharge}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-white/50">
                    Service Charges
                  </span>
                  <span className="font-semibold">
                    ₹{serviceCharge}
                  </span>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      Total Fare
                    </span>

                    <span className="text-2xl font-bold text-azure">
                      ₹{totalFare}
                    </span>
