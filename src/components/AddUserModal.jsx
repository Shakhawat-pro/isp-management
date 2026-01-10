"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { addNewClient } from "./server";

export default function AddUserModal({ onClose, onSubmit, locations }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        client_id: "",
        location: "",
        address: "",
        phone: "",
        package_name: "",
        package_price: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await addNewClient({ clientData: form });

            if (!res.success) throw new Error(res.error || "Something went wrong");
            onClose();
            setForm({
                name: "",
                client_id: "",
                location: "",
                address: "",
                phone: "",
                package_name: "",
                package_price: "",
            });
            toast.success("User added successfully!");
        } catch (err) {
            toast.error("Error: " + err.message);
        } finally{
            setLoading(false);
        }

    };

    return (
        <dialog id="add-user-modal" className="modal">
            <div className="modal-box max-w-lg rounded-2xl shadow-xl bg-white border-t-4 border-primary p-8 relative">
                <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ✕
                </button>
                <div className="flex flex-col items-center mb-4">
                    <span className="text-2xl font-extrabold text-primary mb-1">Add New User</span>
                    <span className="badge badge-primary/20 text-primary font-semibold">User Entry</span>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="label">
                            <span className="label-text font-semibold">Name</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            className="input input-bordered w-full"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">
                            <span className="label-text font-semibold">Client ID</span>
                        </label>
                        <input
                            type="text"
                            name="client_id"
                            placeholder="Client ID"
                            className="input input-bordered w-full"
                            value={form.client_id}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">
                            <span className="label-text font-semibold">Location / Sector</span>
                        </label>
                        {/* <input
                            type="text"
                            name="location"
                            placeholder="Location / Sector"
                            className="input input-bordered w-full"
                            value={form.location}
                            onChange={handleChange}
                        /> */}
                        <select
                            name="location"
                            className="select select-bordered w-full "
                            value={form.location}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select Location</option>
                            {locations.map((loc) => (
                                <option key={loc.value} value={loc.value}>{loc.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">
                            <span className="label-text font-semibold">Address</span>
                        </label>
                        <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            className="input input-bordered w-full"
                            value={form.address}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="label">
                            <span className="label-text font-semibold">Phone</span>
                        </label>
                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone"
                            className="input input-bordered w-full"
                            value={form.phone}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="label">
                            <span className="label-text font-semibold">Package Name</span>
                        </label>
                        <input
                            type="text"
                            name="package_name"
                            placeholder="Package Name"
                            className="input input-bordered w-full"
                            value={form.package_name}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="label">
                            <span className="label-text font-semibold">Package Price</span>
                        </label>
                        <input
                            type="number"
                            name="package_price"
                            placeholder="Package Price"
                            className="input input-bordered w-full"
                            value={form.package_price}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full mt-2">
                        Add User
                    </button>
                </form>
            </div>
        </dialog>
    );
}
