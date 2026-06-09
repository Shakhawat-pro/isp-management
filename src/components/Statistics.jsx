import React, { useMemo, useState } from 'react';
import { User } from 'lucide-react';

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const MONTH_CODES = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

const parseStartDate = (value) => {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value)) return value;

    const text = value.toString().replace(/"/g, "").trim();
    if (!text) return null;

    let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        return new Date(year, month - 1, day);
    }

    match = text.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
    if (match) {
        let year = Number(match[3]);
        if (year < 100) year += 2000;
        const month = Number(match[2]);
        const day = Number(match[1]);
        return new Date(year, month - 1, day);
    }

    const fallback = new Date(text);
    return Number.isNaN(fallback) ? null : fallback;
};

const parsePaymentAmount = (value) => {
    if (!value) return 0;
    const text = value.toString().replace(/"/g, "").trim();
    if (!text) return 0;
    if (text.toLowerCase() === "due") return 0;

    const parts = text.split("-");
    if (parts.length >= 4) {
        const amount = parseFloat(parts[3]);
        if (!Number.isNaN(amount)) return amount;
    }

    const fallback = parseFloat(text);
    return Number.isNaN(fallback) ? 0 : fallback;
};

const Statistics = ({ initialData }) => {
    const now = useMemo(() => new Date(), []);
    const currentMonthIndex = now.getMonth();
    const getCurrentMonthCode = () => MONTH_CODES[currentMonthIndex];

    const [statsOpen, setStatsOpen] = useState(false);
    const [selectedStatsMonth, setSelectedStatsMonth] = useState(getCurrentMonthCode());

    const selectedMonthIndex = MONTH_CODES.indexOf(selectedStatsMonth);
    const selectedMonthName = MONTH_NAMES[selectedMonthIndex] || "";

    const {
        originalMonthPaidTotal,
        originalMonthPaidCount,
        originalMonthDueTotal,
        originalMonthDueCount,
        originalMonthExpectedTotal,
        originalMonthExpectedUsers,
        selectedMonthPaidTotal,
        selectedMonthPaidCount,
        selectedMonthDueTotal,
        selectedMonthDueCount,
        selectedMonthExpectedTotal,
        selectedMonthExpectedUsers,
    } = useMemo(() => {
        const clients = initialData?.clients || [];
        return clients.reduce(
            (acc, c) => {
                const payments = c.payments || {};
                const starting_date = parseStartDate(c.starting_date);
                let effectiveStartMonth = 0;
                if (starting_date && !Number.isNaN(starting_date)) {
                    const startYear = starting_date.getFullYear();
                    const startMonth = starting_date.getMonth();
                    if (startYear === now.getFullYear()) {
                        effectiveStartMonth = startMonth;
                    } else if (startYear > now.getFullYear()) {
                        effectiveStartMonth = 12;
                    }
                }

                const price = parseFloat(c.package_price) || 0;
                if (effectiveStartMonth <= selectedMonthIndex) {
                    acc.originalMonthExpectedUsers += 1;
                    acc.originalMonthExpectedTotal += price;

                    const originalValue = payments[selectedStatsMonth];
                    const originalPaidAmount = parsePaymentAmount(originalValue);
                    const originalDueAmount = Math.max(price - originalPaidAmount, 0);

                    if (originalPaidAmount > 0) {
                        acc.originalMonthPaidTotal += originalPaidAmount;
                        acc.originalMonthPaidCount += 1;
                    }

                    if (originalDueAmount > 0) {
                        acc.originalMonthDueTotal += originalDueAmount;
                        acc.originalMonthDueCount += 1;
                    }
                }

                acc.selectedMonthExpectedUsers += 1;
                acc.selectedMonthExpectedTotal += price;
                const v = payments[selectedStatsMonth];
                const paidAmount = parsePaymentAmount(v);
                const dueAmount = Math.max(price - paidAmount, 0);

                if (paidAmount > 0) {
                    acc.selectedMonthPaidTotal += paidAmount;
                    acc.selectedMonthPaidCount += 1;
                }

                if (dueAmount > 0) {
                    acc.selectedMonthDueTotal += dueAmount;
                    acc.selectedMonthDueCount += 1;
                }
                return acc;
            },
            {
                originalMonthPaidTotal: 0,
                originalMonthPaidCount: 0,
                originalMonthDueTotal: 0,
                originalMonthDueCount: 0,
                originalMonthExpectedTotal: 0,
                originalMonthExpectedUsers: 0,
                selectedMonthPaidTotal: 0,
                selectedMonthPaidCount: 0,
                selectedMonthDueTotal: 0,
                selectedMonthDueCount: 0,
                selectedMonthExpectedTotal: 0,
                selectedMonthExpectedUsers: 0,
            }
        );
    }, [initialData?.clients, now, selectedMonthIndex, selectedStatsMonth]);

    return (
        <div className="mb-10">
            <button
                className="w-full flex items-center justify-between bg-white shadow border-t-4 border-primary rounded px-4 py-3 font-semibold text-lg focus:outline-none"
                onClick={() => setStatsOpen((open) => !open)}
            >
                <span>Statistics</span>
                <svg
                    className={`w-6 h-6 transition-transform duration-300 ${statsOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                style={{
                    maxHeight: statsOpen ? 500 : 0,
                    opacity: statsOpen ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s"
                }}
            >
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-600">Selected Month</span>
                        <select
                            className="select select-bordered w-full sm:w-60"
                            required
                            value={selectedStatsMonth}
                            onChange={(e) => setSelectedStatsMonth(e.target.value)}
                        >
                            <option value="" disabled>Select Month</option>
                            {MONTH_NAMES.map((month, index) => (
                                <option key={index} value={MONTH_CODES[index]}>
                                    {month}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="text-sm text-slate-500">
                        {selectedMonthName ? `Showing ${selectedMonthName}` : ""}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                    <div className="card bg-white shadow border-t-4 border-primary">
                        <div className="card-body">
                            <h2 className="card-title text-lg font-semibold">Total Users</h2>
                            <p className="text-3xl font-bold text-primary">{initialData?.total_clients ?? 0}</p>
                            <p className="text-sm text-slate-500">{selectedMonthName} Users</p>
                            <p className="text-lg font-bold text-primary">{selectedMonthExpectedUsers}</p>
                        </div>
                    </div>
                    <div className="card bg-white shadow border-t-4 border-success">
                        <div className="card-body">
                            <h2 className="card-title text-lg font-semibold">Total Payment</h2>
                            <p className="text-3xl font-bold text-success">৳{initialData?.total_expected ?? 0}</p>
                            <p className="text-sm text-slate-500">{selectedMonthName} Expected</p>
                            <p className="text-lg font-bold text-primary">৳{selectedMonthExpectedTotal}</p>
                        </div>
                    </div>
                    {/* total monthly payment */}
                    <div className="card bg-white shadow border-t-4 border-info">
                        <div className="card-body">
                            <h2 className="card-title text-lg font-semibold">Payment</h2>
                            <p className="text-3xl font-bold text-info flex items-center gap-2">
                                ৳{originalMonthPaidTotal}
                                <User size={35} className=' border rounded-full p-1' />
                            </p>
                            <p className="text-sm text-slate-500 mt-1">{originalMonthPaidCount} users</p>
                            {/* Sheet raw data */}
                            <p>
                                 Sheet = ৳{selectedMonthPaidTotal} | {selectedMonthPaidCount}
                            </p>
                        </div>
                    </div>
                    {/* total monthly due */}
                    <div className="card bg-white shadow border-t-4 border-warning">
                        <div className="card-body">
                            <h2 className="card-title text-lg font-semibold">Due</h2>
                            <p className="text-3xl font-bold text-warning flex items-center gap-2">৳{selectedMonthDueTotal} <User size={35} className=' border rounded-full p-1' /></p>
                            <p className="text-sm text-slate-500 mt-1">{selectedMonthDueCount} users</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;