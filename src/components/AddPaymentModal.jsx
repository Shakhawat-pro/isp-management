"use client";

import React, { useEffect, useState } from "react";
import { addPayment } from "@/components/server";
import Select from 'react-select'
import { toast } from 'sonner';
import { generateReceiptPDF } from './pdf/ReceiptPdf';


export default function AddPaymentModal({ users = [], locations = [], onClose, onSubmit }) {

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [filteredUsers, setFilteredUsers] = useState(users);

  // Get today's date in yyyy-mm-dd format
  const todayStr = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    client_id: "",
    month: "",
    amount: "",
    payment_method: "",
    payment_date: todayStr,
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [createdPayment, setCreatedPayment] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];

  const methods = ["bkash", "rocket", "nagad", "cash"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    // Always use form.amount if present, otherwise fallback to selectedUser.package_price
    const amount = form.amount || (selectedUser ? selectedUser.package_price : "");
    const paymentData = `
    ${form.payment_date.split('-').reverse().join('-')}-${amount}-${form.payment_method}`;
    const formToSubmit = {
      client_id: form.client_id,
      month: form.month,
      payment_data: paymentData,
    };
    try {
      const res = await addPayment(formToSubmit);
      if (res.success) {
        setFeedback({ type: "success", message: res.message || "Payment added successfully!" });
        if (onSubmit) onSubmit();
        // keep modal open and expose receipt actions
        const paidAmount = form.amount || (selectedUser ? selectedUser.package_price : "");
        const paymentObj = {
          client_id: form.client_id,
          month: form.month,
          amount: paidAmount,
          payment_method: form.payment_method,
          payment_date: form.payment_date,
        };
        setCreatedPayment(paymentObj);
        setLoading(false);
      } else {
        setFeedback({ type: "error", message: res.message || "Failed to add payment." });
        setLoading(false);
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Failed to add payment." });
      setLoading(false);
    }
  };

  // Clear form and selected user
  const handleClear = () => {
    setSelectedUser(null);
    setForm({
      client_id: "",
      month: "",
      amount: "",
      payment_method: "",
      payment_date: todayStr,
    });
    setCreatedPayment(null);
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
  // console.log("datasss", clientMonths);


  // Helper to format date as DD-MM-YYYY
  function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }


  // Reset all state when users prop changes (e.g. after payment add)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredUsers(users);
    setSelectedUser(null);
    setSelectedLocation("all");
    setForm({
      client_id: "",
      month: "",
      amount: "",
      payment_method: "",
      payment_date: todayStr,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);
  
  return (
    <dialog id="add-payment-modal" className="modal">
      <div className="modal-box max-w-4xl max-h-11/12 rounded-2xl shadow-xl bg-white border-t-4 border-success p-4 sm:p-8 relative">
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
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Client detail */}
          <div className="w-full lg:max-w-[40%]">
            {selectedUser ? (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="mb-2">
                  <span className="font-bold">Name:</span> {selectedUser.name}<br />
                  <span className="font-bold">Client ID:</span> {selectedUser.client_id}<br />
                  <span className="font-bold">Location:</span> {selectedUser.location}<br />
                  <span className="font-bold">Address:</span> {selectedUser.address}<br />
                  <span className="font-bold">Phone:</span> {selectedUser.phone}<br />
                  <span className="font-bold">Package:</span> {selectedUser.package_name} <br />
                  <span className="font-bold">Package Price:</span> {selectedUser.package_price}<br />
                  <span className="font-bold">Starting Date:</span> {formatDate(selectedUser.starting_date)}<br />
                  <span className="font-bold">Total Due:</span> {selectedUser.total_due}<br />
                  <span className="font-bold">Total Paid:</span> {selectedUser.total_paid}<br />
                  <span className="font-bold">Notes:</span> {selectedUser.notes}
                </div>
                <div className="mt-4">
                  <span className="font-bold">Payment Status:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUser &&
                      (() => {
                        const now = new Date();
                        const currentYear = now.getFullYear();
                        const currentMonthIndex = now.getMonth();

                        // Determine effective start month
                        let startMonth = 0;
                        if (selectedUser.starting_date) {
                          const sd = new Date(selectedUser.starting_date);
                          if (!isNaN(sd) && sd.getFullYear() === currentYear) {
                            startMonth = sd.getMonth();
                          }
                        }

                        const payments = selectedUser.payments || [];

                        return months.map((month, index) => {
                          // Skip months before starting month
                          if (index < startMonth) return null;

                          const value = payments[month];
                          const isPaid =
                            value &&
                            value.toString().trim() !== "" &&
                            value.toString().toLowerCase() !== "due";

                          let status = "";
                          let badgeClass = "";

                          // 🔴 DUE
                          if (index <= currentMonthIndex && !isPaid) {
                            status = "Due";
                            badgeClass = "bg-red-200 text-red-800";
                          }

                          // 🟢 PAID
                          else if (index <= currentMonthIndex && isPaid) {
                            status = "Paid";
                            badgeClass = "bg-green-200 text-green-800";
                          }

                          // 🔵 ADVANCE PAID
                          else if (index > currentMonthIndex && isPaid) {
                            status = "Advance";
                            badgeClass = "bg-blue-200 text-blue-800";
                          }

                          // Ignore unpaid future months
                          else {
                            return null;
                          }

                          return (
                            <span
                              key={month}
                              className={`badge px-3 py-1 text-xs font-semibold ${badgeClass}`}
                            >
                              {month} {status}
                            </span>
                          );
                        });
                      })()}
                  </div>

                </div>
              </div>
            ) : (
              <div className="text-gray-400 italic">Select a client to view details</div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full lg:max-w-[60%]">
            {/* Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 w-full">
              {/* filter */}
              <select
                name="location"
                className="select select-bordered w-full sm:w-fit bg-gray-50"
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
                // value={filteredUsers
                //   .map(u => ({
                //     value: u.client_id,
                //     label: `${u.name} (${u.client_id})`
                //   }))
                //   .find(option => option.value === form.client_id) || null}
                onChange={(selectedOption) => {
                  const user = filteredUsers.find(u => u.client_id === (selectedOption ? selectedOption.value : null)) || null;
                  setSelectedUser(user);
                  setForm((prev) => ({
                    ...prev,
                    client_id: selectedOption ? selectedOption.value : "",
                    amount: user && user.package_price ? user.package_price : ""
                  }));
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
            <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full">
              <button type="submit" className="btn btn-success flex-1 flex items-center justify-center py-2" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Add Payment"
                )}
              </button>
              <button type="button" className="btn btn-outline flex-1 py-2" onClick={handleClear} disabled={loading}>
                Clear
              </button>
            </div>
            {feedback && (
              <div className={`mt-2 text-center rounded-lg py-2 px-3 font-semibold ${feedback.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {feedback.message}
              </div>
            )}
            {createdPayment && (
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-success font-medium mb-3 text-center">
                  Payment recorded. You can download or print the receipt.
                </p>

                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm py-2"
                    onClick={async () => {
                      try {
                        setDownloading(true);
                        const user = selectedUser || users.find(u => u.client_id === createdPayment.client_id);
                        const blob = await generateReceiptPDF(user, createdPayment);
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `receipt_${(user && user.client_id) || createdPayment.client_id}_${createdPayment.month}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                        toast.success('Receipt downloaded');
                      } catch (err) {
                        toast.error('Failed to generate receipt');
                      } finally {
                        setDownloading(false);
                      }
                    }}
                    disabled={downloading}
                  >
                    {downloading ? 'Preparing…' : 'Download Receipt'}
                  </button>
                  {/* print */}
                  <button
                    type="button"
                    className="btn btn-outline btn-sm py-2"
                    onClick={async () => {
                      try {
                        setPrinting(true);
                        const user = selectedUser || users.find(u => u.client_id === createdPayment.client_id);
                        const blob = await generateReceiptPDF(user, createdPayment);
                        const url = URL.createObjectURL(blob);
                        const printWindow = window.open(url, '_blank');
                        printWindow.onload = () => {
                          printWindow.focus();
                          printWindow.print();
                        };
                      } catch (err) {
                        toast.error('Failed to print receipt: ' + (err?.message || err));
                      }
                      finally {
                        setPrinting(false);
                      }
                    }}
                    disabled={printing}
                  >
                    {printing ? 'Printing…' : 'Print Receipt'}
                  </button>

                  {/* <button
                    type="button"
                    className="btn btn-outline btn-sm py-2"
                    onClick={async () => {
                      try {
                        setPrinting(true);
                        const user = selectedUser || users.find(u => u.client_id === createdPayment.client_id);
                        const blob = await generateReceiptPDF(user, createdPayment);
                        const url = URL.createObjectURL(blob);

                        const iframe = document.createElement('iframe');
                        iframe.style.position = 'fixed';
                        iframe.style.right = '0';
                        iframe.style.bottom = '0';
                        iframe.style.width = '0';
                        iframe.style.height = '0';
                        iframe.style.border = '0';
                        iframe.src = url;

                        document.body.appendChild(iframe);

                        iframe.onload = () => {
                          try {
                            iframe.contentWindow.focus();
                            iframe.contentWindow.print();
                          } catch {
                            toast.error('Print failed');
                          }

                          setTimeout(() => {
                            URL.revokeObjectURL(url);
                            document.body.removeChild(iframe);
                          }, 1000);
                        };
                      } catch (err) {
                        toast.error('Failed to print receipt: ' + (err?.message || err));
                      } finally {
                        setPrinting(false);
                      }
                    }}
                    disabled={printing}
                  >
                    {printing ? 'Printing…' : 'Print Receipt'}
                  </button> */}

                  <button
                    type="button"
                    className="btn btn-primary btn-sm py-2"
                    onClick={() => {
                      setCreatedPayment(null);
                      onClose();
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

      </div>
    </dialog>
  );
}
