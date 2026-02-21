import Image from 'next/image';
import React from 'react';

const Navbar = ({locations, searchTerm, setSearchTerm, selectedLocation, setSelectedLocation, openModal, resetFilters }) => {
    return (
        <div className="navbar bg-base-100 rounded-2xl shadow flex flex-col sm:flex-row items-center justify-between gap-4 p-3 mb-8">
            <div className="flex items-center gap-2">
                <div className='relative  w-14 h-14 rounded-full overflow-hidden'>
                    <Image src="/logo.png" alt="ISP Manager Logo" fill className='object-cover scale-150' />
                </div>
                <span className="text-3xl  font-semibold text-primary">Akota Internet</span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                {(searchTerm || selectedLocation !== "all") && (
                    <button
                        className="btn btn-outline btn-error flex items-center gap-1 w-full sm:w-auto justify-center"
                        type="button"
                        onClick={resetFilters}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        Reset
                    </button>
                )}
                {/* Filter */}
                <select
                    value={selectedLocation}
                    onChange={e => setSelectedLocation(e.target.value)}
                    className="select w-full sm:w-auto"
                >
                    {locations.map((loc) => (
                        <option key={loc.value} value={loc.value}>{loc.label}</option>
                    ))}
                </select>
                {/* Search */}
                <input
                    type="text"
                    placeholder="Search name or ID..."
                    className="input input-bordered w-full sm:w-56"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />

                {/* Search button is now just for UI, search is live */}
                {/* <button className="btn btn-outline hover:bg-gray-200 flex items-center gap-1 w-full sm:w-auto justify-center" tabIndex={-1} type="button" disabled>
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    Search
                </button> */}

                <div className="dropdown dropdown-bottom dropdown-end w-full sm:w-auto">
                    <button
                        tabIndex={0}
                        className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-center"
                    >
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
    );
};

export default Navbar;