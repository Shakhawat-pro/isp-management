"use client"
import AddUserModal from './AddUserModal';
import AddPaymentModal from './AddPaymentModal';
import axios from 'axios';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import Navbar from './Navbar';
import UserDetails from './UserDetails';
import Statistics from './Statistics';
import UserPDF from './pdf/UserPdf';
import Fuse from 'fuse.js';

// const locations = [
//     { label: "All", value: "all" },
//     { label: "Nasir Uddin Rod", value: "nasir-uddin-rod" },
//     { label: "Majar goli", value: "majar-goli" },
//     { label: "Rasulpur", value: "rasulpur" },
//     { label: "Balli GOli", value: "balli-goli" },
//     { label: "Nij Goli", value: "nij-goli" },
//     { label: "Siddiq Goli", value: "siddiq-goli" },
//     { label: "Shanshine GOli", value: "shanshine-goli" },
//     { label: "School 1", value: "school-1" },
//     { label: "School 2", value: "school-2" },
// ]

const HomePage = ({ initialData }) => {

    // console.log(initialData);


    const [selectedUser, setSelectedUser] = useState(null);
    // Remove data state, use initialData.clients directly
    const [statsOpen, setStatsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("all");
    const [duplicatesOpen, setDuplicatesOpen] = useState(false);
    // For filtered data
    // filteredData is now derived, not state



    const normalizeText = (value) => {
        if (value === null || value === undefined) return "";
        return value.toString().trim().toLowerCase().normalize("NFC");
    };

    // filteredData is derived from initialData.clients, searchTerm, and selectedLocation
    const filteredData = useMemo(() => {
        const clients = initialData.clients || [];
        const byLocation = selectedLocation === "all"
            ? clients
            : clients.filter(client => client.location === selectedLocation);

        const term = normalizeText(searchTerm);
        if (!term) return byLocation;

        const fuse = new Fuse(byLocation, {
            includeScore: false,
            threshold: 0.3,
            distance: 100,
            ignoreLocation: true,
            keys: [
                { name: "name", getFn: (item) => normalizeText(item.name) },
                { name: "client_id", getFn: (item) => normalizeText(item.client_id) }
            ]
        });

        return fuse.search(term).map(result => result.item);
    }, [initialData.clients, searchTerm, selectedLocation]);

    const duplicateGroups = useMemo(() => {
        const clients = initialData.clients || [];
        const map = new Map();
        clients.forEach((client) => {
            const id = normalizeText(client?.client_id);
            if (!id) return;
            if (!map.has(id)) map.set(id, []);
            map.get(id).push(client);
        });
        return Array.from(map.entries())
            .filter(([, list]) => list.length > 1)
            .map(([id, list]) => ({ id, list }));
    }, [initialData.clients]);

    // console.log(filteredData);


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






    const locations = [{ label: "All", value: "all" }, ...(initialData.locations || [])];

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedLocation("all");
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-white to-slate-200 text-slate-800">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Navbar
                    locations={locations}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                    openModal={openModal}
                    resetFilters={resetFilters}
                />
                <Statistics initialData={initialData} />
                {/* DUPLICATE USER LIST */}
                {duplicateGroups.length > 0 && (
                    <div className="mb-10">
                        <button
                            className="w-full flex items-center justify-between bg-white shadow border-t-4 border-error rounded px-4 py-3 font-semibold text-lg focus:outline-none"
                            onClick={() => setDuplicatesOpen((open) => !open)}
                        >
                            <span>Duplicate Client ID ({duplicateGroups.length})</span>
                            <svg
                                className={`w-6 h-6 transition-transform duration-300 ${duplicatesOpen ? "rotate-180" : ""}`}
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
                                maxHeight: duplicatesOpen ? 500 : 0,
                                opacity: duplicatesOpen ? 1 : 0,
                                overflow: "hidden",
                                transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s"
                            }}
                        >
                            <div className="bg-white shadow border border-gray-200 rounded mt-4">
                                <div className="divide-y divide-gray-200">
                                    {duplicateGroups.map((group) => (
                                        <div key={group.id} className="p-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-base">Client ID: {group.id}</h3>
                                                <span className="text-sm text-error font-semibold">{group.list.length} users</span>
                                            </div>
                                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {group.list.map((client) => (
                                                    <button
                                                        key={client.no ?? `${group.id}-${client.name ?? "unknown"}`}
                                                        type="button"
                                                        onClick={() => setSelectedUser(client)}
                                                        className="text-left p-2 rounded border border-gray-200 hover:bg-primary/10 transition"
                                                    >
                                                        <div className="font-semibold">{client.name || "(No name)"}</div>
                                                        <div className="text-sm text-gray-500">ID: {client.client_id || "(Missing)"}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* User List */}
                    <div className="w-full lg:w-[35%]">
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

                                    {filteredData.map((client) => (
                                        <div key={client.no} onClick={() => setSelectedUser(client)} className="py-3 px-2 flex flex-col hover:bg-primary/10 rounded cursor-pointer transition">
                                            <h1 className="font-semibold text-base">{client.name}</h1>
                                            <div className="flex items-center justify-between text-sm font-semibold">
                                                <p className="text-gray-500 w-full">ID: {client.client_id}</p>
                                                {/* Assuming payments is an object with month keys */}
                                                {client.payments && client.payments[getCurrentMonthCode()] === "" && (
                                                    <p className="text-red-500 min-w-12.5">Due</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* User Details Section */}
                    <div className="w-full lg:max-w-[70%]">
                        <div className="bg-white shadow border border-gray-200 min-h-75 rounded-lg p-6">
                            <UserDetails user={selectedUser} />
                        </div>
                    </div>
                </div>
            </div>
            {/* Modals */}
            <AddUserModal
                onClose={() => closeModal("add-user-modal")}
                locations={locations.slice(1)}
            />

            <AddPaymentModal
                users={initialData.clients || []}
                locations={locations.slice(1)}
                onClose={() => {
                    // setSelectedUser(null);
                    closeModal("add-payment-modal")
                }}
            />

            {/* test for printable user detail table - user details, and each month but eamty space  size should be a5 size*/}
            <div className=''>
                <UserPDF />
            </div>
        </div>
    );
};

export default HomePage;