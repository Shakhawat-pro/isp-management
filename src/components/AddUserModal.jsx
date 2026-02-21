"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { addNewClient } from "./server";
import { generateUserPDF } from "./pdf/UserPdf";

export default function AddUserModal({ onClose, onSubmit, locations }) {
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [printing, setPrinting] = useState(false);
    const [createdUser, setCreatedUser] = useState(null);

    // Get today's date in yyyy-mm-dd format
    const todayStr = new Date().toISOString().split('T')[0];

    const [form, setForm] = useState({
        name: "",
        client_id: "cls.",
        location: "",
        address: "",
        phone: "",
        starting_date: todayStr,
        package_name: "",
        package_price: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "package_name") {
            // Set package_price based on selected package_name
            setForm((prev) => ({
                ...prev,
                package_name: value,
                package_price: value, // Assuming package_name is the price
            }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await addNewClient({ clientData: form });

            if (!res.success) throw new Error(res.error || "Something went wrong");
            // Keep the modal open and show a download button for the created user
            setCreatedUser({ ...form });
            setForm({
                name: "",
                client_id: "",
                location: "",
                address: "",
                phone: "",
                starting_date: todayStr,
                package_name: "",
                package_price: "",
            });
            toast.success("User added successfully!");
        } catch (err) {
            toast.error("Error: " + err.message);
        } finally {
            setLoading(false);
        }

    };

    const handlePrint = async () => {
        if (!createdUser) return;
        try {
            setPrinting(true);
            const blob = await generateUserPDF(createdUser);
            const url = URL.createObjectURL(blob);
            const printWindow = window.open(url, '_blank');
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
            };
        } catch (err) {
            toast.error('Failed to print PDF: ' + (err?.message || err));
        }
        finally {
            setPrinting(false);
        }
    };


    const handleDirectPrint = async () => {
        if (!createdUser) return;

        try {
            setPrinting(true);

            const blob = await generateUserPDF(createdUser);
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
            toast.error('Failed to print PDF: ' + (err?.message || err));
        } finally {
            setPrinting(false);
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
                            <span className="label-text font-semibold">Starting Date</span>
                        </label>
                        <input
                            type="date"
                            name="starting_date"
                            placeholder="Starting Date"
                            className="input input-bordered w-full"
                            value={form.starting_date}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="label">
                            <span className="label-text font-semibold">Package Name</span>
                        </label>
                        {/* <input
                            type="text"
                            name="package_name"
                            placeholder="Package Name"
                            className="input input-bordered w-full"
                            value={form.package_name}
                            onChange={handleChange}
                        /> */}
                        <select
                            name="package_name"
                            className="select select-bordered w-full "
                            value={form.package_name}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select Price</option>
                            <option value="400">400</option>
                            <option value="500">500</option>
                            <option value="600">600</option>
                            <option value="700">700</option>
                            <option value="800">800</option>
                            <option value="1000">1000</option>
                            <option value="1200">1200</option>
                            <option value="1500">1500</option>
                        </select>
                    </div>
                    {/* <div>
                        <label className="label">
                            <span className="label-text font-semibold">Package Price</span>
                        </label>
                        <select
                            name="package_price"
                            className="select select-bordered w-full "
                            value={form.package_price}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select Price</option>
                            <option value="400">400</option>
                            <option value="500">500</option>
                            <option value="600">600</option>
                            <option value="700">700</option>
                            <option value="800">800</option>
                            <option value="1000">1000</option>
                            <option value="1200">1200</option>
                            <option value="1500">1500</option>
                        </select>
                    </div> */}
                    <button type="submit" className="btn btn-primary w-full mt-2">
                        Add User
                    </button>
                    {createdUser && (
                        <div className="mt-6 pt-4 border-t">
                            <p className="text-sm text-success font-medium mb-3 text-center">
                                User created successfully. You can download or print the A5 receipt.
                            </p>

                            <div className="flex flex-wrap justify-center gap-3">
                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={async () => {
                                        try {
                                            setDownloading(true);
                                            const blob = await generateUserPDF(createdUser);
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `${(createdUser.name || 'user').replace(/\s+/g, '_')}.pdf`;
                                            document.body.appendChild(a);
                                            a.click();
                                            a.remove();
                                            URL.revokeObjectURL(url);
                                            toast.success('PDF downloaded');
                                        } catch (err) {
                                            toast.error('Failed to generate PDF');
                                        } finally {
                                            setDownloading(false);
                                        }
                                    }}
                                    disabled={downloading}
                                >
                                    {downloading ? 'Preparing…' : 'Download PDF'}
                                </button>

                                <button 
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={handlePrint}
                                    disabled={printing}
                                >
                                    {printing ? 'Printing…' : 'Print A4'}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={handleDirectPrint}
                                    disabled={printing}
                                >
                                    {printing ? 'Printing…' : 'Direct Print A5'}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setCreatedUser(null);
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
        </dialog>
    );
}
