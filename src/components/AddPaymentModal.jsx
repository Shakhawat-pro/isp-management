"use client";

import React, { useState } from "react";
import Select from 'react-select'

export default function AddPaymentModal({ users = [], locations = [], onClose, onSubmit }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [filteredUsers, setFilteredUsers] = useState(users);

  console.log(users);



  const [form, setForm] = useState({
    client_id: "",
    month: "",
    amount: "",
    payment_method: "",
    payment_date: "",
  });
console.log(selectedUser);

  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];

  const methods = ["bkash", "rocket", "nagad", "cash"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    onClose();
  };

  // Helper to get months between two dates (inclusive)
  function getMonthsRange(startMonth, startYear, endMonth, endYear) {
    const monthsArr = [];
    let y = startYear, m = startMonth;
    while (y < endYear || (y === endYear && m <= endMonth)) {
      monthsArr.push({ month: months[m], year: y });
      m++;
      if (m > 11) { m = 0; y++; }
    }
    return monthsArr;
  }

  // Parse starting_date and get months to show
  let clientMonths = [];
  let paidMonths = {};
  if (selectedUser) {
    // Parse starting_date (format: YYYY-MM-DD or empty)
    let startYear = new Date().getFullYear();
    let startMonth = 0;
    if (selectedUser.starting_date) {
      const d = new Date(selectedUser.starting_date);
      startYear = d.getFullYear();
      startMonth = d.getMonth();
    }
    const now = new Date();
    const endYear = now.getFullYear();
    const endMonth = now.getMonth();
    // If starting year is previous year, start from Jan
    if (startYear < now.getFullYear()) {
      startMonth = 0;
    }
    clientMonths = getMonthsRange(startMonth, startYear, endMonth, endYear);
    paidMonths = selectedUser.payments || {};
  }

  return (
    <dialog id="add-payment-modal" className="modal">
      <div className="modal-box max-w-4xl rounded-2xl shadow-xl bg-white border-t-4 border-success p-8 relative">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <div className="flex flex-col items-center mb-4">
          <span className="text-2xl font-extrabold text-success mb-1">Add Payment</span>
          <span className="badge badge-success/20 text-success font-semibold">Payment Entry</span>
        </div>
        <div className="flex gap-8">
          {/* Client detail */}
          <div className="max-w-[40%] w-full">
            {selectedUser ? (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="mb-2">
                  <span className="font-bold">Name:</span> {selectedUser.name}<br />
                  <span className="font-bold">Client ID:</span> {selectedUser.client_id}<br />
                  <span className="font-bold">Location:</span> {selectedUser.location}<br />
                  <span className="font-bold">Address:</span> {selectedUser.address}<br />
                  <span className="font-bold">Phone:</span> {selectedUser.phone}<br />
                  <span className="font-bold">Package:</span> {selectedUser.package_name} ({selectedUser.package_price})<br />
                  <span className="font-bold">Total Due:</span> {selectedUser.total_due}<br />
                  <span className="font-bold">Total Paid:</span> {selectedUser.total_paid}<br />
                  <span className="font-bold">Notes:</span> {selectedUser.notes}
                </div>
                <div className="mt-4">
                  <span className="font-bold">Payment Status:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {clientMonths.map(({ month, year }) => {
                      const paid = paidMonths[month] && paidMonths[month] !== "";
                      return (
                        <span
                          key={month + year}
                          className={`badge px-3 py-1 text-xs font-semibold ${paid ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}
                        >
                          {month} {year} {paid ? 'Paid' : 'Unpaid'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 italic">Select a client to view details</div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4  w-full max-w-[60%]">
            {/* Filter */}
            <div className="flex items-center gap-5 w-full ">
              {/* filter */}
              <select
                name="location"
                className="select select-bordered min-w-[150px] w-fit  bg-gray-50"
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  if (e.target.value === "all") {
                    setFilteredUsers(users);
                  } else {
                    setFilteredUsers(users.filter(u => u.location === e.target.value));
                  }
                }}
              >
                <option value="all">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc.value} value={loc.value}>{loc.label}</option>
                ))}
              </select>
              <Select
                className="w-full"
                options={filteredUsers.map(u => ({
                  value: u.client_id,
                  label: `${u.name} (${u.client_id})`
                }))}
                value={filteredUsers
                  .map(u => ({
                    value: u.client_id,
                    label: `${u.name} (${u.client_id})`
                  }))
                  .find(option => option.value === form.client_id) || null}
                onChange={(selectedOption) => {
                  const user = filteredUsers.find(u => u.client_id === (selectedOption ? selectedOption.value : null)) || null;
                  setSelectedUser(user);
                  setForm((prev) => ({ ...prev, client_id: selectedOption ? selectedOption.value : "" }))
                }}
                instanceId="add-payment-client-select"
                inputId="add-payment-client-input"
                placeholder="Select Client"
                isClearable
              />

            </div>
            {/* data */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Month</span>
              </label>
              <select
                name="month"
                className="select select-bordered w-full"
                value={form.month}
                onChange={handleChange}
                required
              >
                <option value="">Select Month</option>
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Amount Paid</span>
              </label>
              <input
                type="number"
                name="amount"
                placeholder="Amount Paid"
                className="input input-bordered w-full"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Payment Date</span>
              </label>
              <input
                type="date"
                name="payment_date"
                className="input input-bordered w-full"
                value={form.payment_date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Payment Method</span>
              </label>
              <select
                name="payment_method"
                className="select select-bordered w-full"
                value={form.payment_method}
                onChange={handleChange}
                required
              >
                <option value="">Select Method</option>
                {methods.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-success w-full mt-2">
              Add Payment
            </button>
          </form>
        </div>

      </div>
    </dialog>
  );
}
