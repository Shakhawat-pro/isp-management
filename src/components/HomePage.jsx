"use client"
import AddUserModal from './AddUserModal';
import AddPaymentModal from './AddPaymentModal';
import axios from 'axios';
import { use, useEffect, useState } from 'react';

const location = [
    { label: "All", value: "all" },
    { label: "Nasir Uddin Rod", value: "nasir-uddin-rod" },
    { label: "Majar goli", value: "majar-goli" },
    { label: "Rasulpur", value: "rasulpur" },
    { label: "Balli GOli", value: "balli-goli" },
    { label: "Nij Goli", value: "nij-goli" },
    { label: "Siddiq Goli", value: "siddiq-goli" },
    { label: "Shanshine GOli", value: "shanshine-goli" },
    { label: "School 1", value: "school-1" },
    { label: "School 2", value: "school-2" },
]

const HomePage = ({ initialData }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [data, setData] = useState(initialData.clients || []);
    console.log(initialData);
    


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData(initialData.clients || []);
    }, [initialData]);

    const openModal = (id) => document.getElementById(id).showModal();
    const closeModal = (id) => document.getElementById(id).close();



    // Deterministic month helpers (avoid locale/timezone differences)
    const MONTH_NAMES = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const MONTH_CODES = [
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];
    const now = new Date();
    const currentMonthIndex = now.getMonth();
    const getCurrentMonthName = () => MONTH_NAMES[currentMonthIndex];
    const getCurrentMonthCode = () => MONTH_CODES[currentMonthIndex];


    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-200 text-slate-800">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Navbar */}
                <div className="navbar bg-base-100 rounded-2xl shadow flex flex-col sm:flex-row items-center justify-between gap-4 p-6 mb-8">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl sm:text-4xl font-extrabold text-primary">ISP Manager</span>
                        <span className="badge badge-lg badge-primary/20 text-primary font-semibold hidden sm:inline">
                            Dashboard
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <select defaultValue="All" className="select">
                            {location.map((loc) => (
                                <option key={loc.value} value={loc.value}>{loc.label}</option>
                            ))}
                        </select>
                        <input type="text" placeholder="Search user..." className="input input-bordered w-40 sm:w-56" />
                        <button className="btn btn-outline hover:bg-gray-200 flex items-center gap-1">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            Search
                        </button>

                        <div className="dropdown dropdown-bottom dropdown-end">
                            <button tabIndex={0} className="btn btn-primary flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="7" r="4"></circle>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 20a6.5 6.5 0 0 1 13 0"></path>
                                </svg>
                                Profile
                            </button>
                            <ul tabIndex={-1} className="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow-sm divide-y divide-gray-200 ">
                                <li>
                                    <button className="btn btn-ghost w-full flex items-center gap-2" onClick={() => openModal("add-user-modal")}>
                                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path>
                                        </svg>
                                        Add User
                                    </button>
                                </li>
                                <li>
                                    <button className="btn btn-ghost w-full flex items-center gap-2" onClick={() => openModal("add-payment-modal")}>
                                        <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a5 5 0 0 0-10 0v2"></path>
                                            <rect x="5" y="11" width="14" height="10" rx="2"></rect>
                                        </svg>
                                        Add Payment
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="btn btn-ghost w-full flex items-center gap-2"
                                        onClick={async () => {
                                            await fetch("/api/logout", { method: "POST" });
                                            window.location.href = "/login";
                                        }}
                                    >
                                        <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V7a2 2 0 0 1 2-2h6"></path>
                                        </svg>
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="card bg-white shadow border-t-4 border-primary">
                        <div className="card-body">
                            <h2 className="card-title text-lg font-semibold">Total Users</h2>
                            <p className="text-3xl font-bold text-primary">1,234</p>
                        </div>
                    </div>
                    <div className="card bg-white shadow border-t-4 border-success">
                        <div className="card-body">
                            <h2 className="card-title text-lg font-semibold">Total Payment</h2>
                            <p className="text-3xl font-bold text-success">567</p>
                        </div>
                    </div>
                    <div className="card bg-white shadow border-t-4 border-info">
                        <div className="card-body">
                            <h2 className="card-title text-lg font-semibold">{getCurrentMonthName()} Payment</h2>
                            <p className="text-3xl font-bold text-info">$12,345</p>
                        </div>
                    </div>
                    <div className="card bg-white shadow border-t-4 border-warning">
                        <div className="card-body">
                            <h2 className="card-title text-lg font-semibold">{getCurrentMonthName()} Due</h2>
                            <p className="text-3xl font-bold text-warning">89</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* User List */}
                    <div className="w-[35%]">
                        <div className="card bg-white shadow border border-gray-200">
                            <div className="card-body">
                                <h2 className="card-title text-xl font-semibold mb-2">User List</h2>
                                <div
                                    className="max-h-150 overflow-y-auto divide-y divide-gray-200"
                                    style={{
                                        scrollbarWidth: "thin",
                                        scrollbarColor: "rgba(156,163,175,0.6) transparent",
                                    }}
                                >
                                    {/* {Array.from({ length: 50 }).map((_, index) => (
                    <div key={index} className="py-3 px-2 flex flex-col hover:bg-primary/10 rounded cursor-pointer transition">
                      <h1 className="font-semibold text-base">Al Amin</h1>
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <p className="text-gray-500 w-full">ID: cls.alamin51</p>
                        {false && <p className="text-red-500 min-w-12.5">500</p>}
                      </div>
                    </div>
                  ))} */}
                                    {data.map((client) => (
                                        <div key={client.client_id} onClick={() => setSelectedUser(client)} className="py-3 px-2 flex flex-col hover:bg-primary/10 rounded cursor-pointer transition">
                                            <h1 className="font-semibold text-base">{client.name}</h1>
                                            <div className="flex items-center justify-between text-sm font-semibold">
                                                <p className="text-gray-500 w-full">ID: {client.client_id}</p>
                                                {/* Assuming payments is an object with month keys */}
                                                {client.payments && client.payments[getCurrentMonthCode()] === "Due" && (
                                                    <p className="text-red-500 min-w-12.5">Due</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* User Detail Placeholder */}
                    <div className="w-full">
                        <div className="card bg-white shadow border border-gray-200 min-h-[300px] flex items-center justify-center">
                            <div className="card-body flex items-center justify-center">
                                <span className="text-gray-400 text-lg">{selectedUser ? selectedUser.name : "Select a user to view details"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modals */}
            <AddUserModal
                onClose={() => closeModal("add-user-modal")}
                locations={location.slice(1)}
            />

            <AddPaymentModal
                users={initialData.clients || []}
                locations={location.slice(1)}
                onClose={() => closeModal("add-payment-modal")}
            />
        </div>
    );
};

export default HomePage;