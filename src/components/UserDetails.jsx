
"use client"

import { useState } from 'react';
import { toast } from 'sonner';
import { generateUserPDF } from './pdf/UserPdf';
import { formatDisplayDate } from '@/lib/dateUtils';

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

const UserDetails = ({ user }) => {
    const [downloading, setDownloading] = useState(false);
    const [printing, setPrinting] = useState(false);

    const handleDownload = async () => {
        if (!user) return;
        try {
            setDownloading(true);
            const blob = await generateUserPDF(user);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${(user.name || 'user').replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            toast.success('PDF downloaded');
        } catch (err) {
            toast.error('Failed to generate PDF: ' + (err?.message || err));
        } finally {
            setDownloading(false);
        }
    };

    // const handlePrint = async () => {
    //     if (!user) return;

    //     try {
    //         setPrinting(true);

    //         const blob = await generateUserPDF(user);
    //         const url = URL.createObjectURL(blob);

    //         // Create hidden iframe
    //         const iframe = document.createElement('iframe');
    //         iframe.style.position = 'fixed';
    //         iframe.style.right = '0';
    //         iframe.style.bottom = '0';
    //         iframe.style.width = '0';
    //         iframe.style.height = '0';
    //         iframe.style.border = '0';
    //         iframe.src = url;

    //         document.body.appendChild(iframe);

    //         iframe.onload = () => {
    //             try {
    //                 iframe.contentWindow.focus();
    //                 iframe.contentWindow.print();
    //             } catch (e) {
    //                 toast.error('Print failed');
    //             }

    //             // Cleanup
    //             setTimeout(() => {
    //                 URL.revokeObjectURL(url);
    //                 document.body.removeChild(iframe);
    //             }, 1000);
    //         };

    //     } catch (err) {
    //         toast.error('Failed to print PDF: ' + (err?.message || err));
    //     } finally {
    //         setPrinting(false);
    //     }
    // };


    const handlePrint = async () => {
        if (!user) return;

        try {
            setPrinting(true);
            const blob = await generateUserPDF(user);
            const url = URL.createObjectURL(blob);
            const printWindow = window.open(url, '_blank');
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
            };
            toast('Open PDF in your browser to print');
        } catch (err) {
            toast.error('Failed to print PDF: ' + (err?.message || err));
        } finally {
            setPrinting(false);
        }
    };

    const handleDirectPrint = async () => {
        if (!user) return;
        try {
            setPrinting(true);
            const blob = await generateUserPDF(user);
            const url = URL.createObjectURL(blob);
            // Desktop: hidden iframe
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.src = url;
            document.body.appendChild(iframe);
            iframe.onload = () => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    URL.revokeObjectURL(url);
                }, 1000);
            };
        } catch (err) {
            toast.error('Failed to print PDF: ' + (err?.message || err));
        }
        finally {
            setPrinting(false);
        }
    };


    if (!user) return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118A7.5 7.5 0 0112 15.75a7.5 7.5 0 017.5 4.368" />
            </svg>
            <span className="text-lg">Select a user to view details</span>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* User Info */}
            <div className="border-b pb-4">
                <div className="flex items-start justify-between mb-3">
                    <h2 className="text-2xl font-bold text-primary">{user.name}</h2>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={handleDownload}
                            disabled={downloading}
                        >
                            {downloading ? 'Preparing...' : 'Download PDF'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm  btn-outline"
                            onClick={handlePrint}
                            disabled={printing}
                        >
                            {printing ? 'Printing...' : 'Print'}
                        </button>
                        {/* <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={handleDirectPrint}
                            disabled={printing}
                        >
                            {printing ? 'Printing...' : 'Direct Print'}
                        </button> */}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-700">
                    <div><span className="font-semibold">ID:</span> {user.client_id}</div>
                    <div><span className="font-semibold">Location:</span> {user.location}</div>
                    <div><span className="font-semibold">Phone:</span> {user.phone}</div>
                    <div><span className="font-semibold">Address:</span> {user.address}</div>
                    <div><span className="font-semibold">Package:</span> {user.package_name} ({user.package_price}৳)</div>
                    <div><span className="font-semibold">Joined:</span> {formatDisplayDate(user.starting_date)}</div>
                    <div><span className="font-semibold text-success">Paid:</span> <span className="text-base font-bold text-success">{user.total_paid}৳</span></div>
                    <div><span className="font-semibold text-success">Advance:</span> <span className="text-base font-bold text-success">{user.advance_payment}৳</span></div>
                    <div><span className="font-semibold text-warning">Due:</span> <span className="text-base font-bold text-warning">{user.total_due}৳</span></div>
                </div>
            </div>
            {/* Monthly Payment Table */}
            <div>
                <h3 className="text-lg font-semibold mb-2">Monthly Payment Status</h3>
                <div className="flex flex-col items-center w-full">
                    <div
                        className="grid grid-cols-2 md:grid-cols-4 grid-rows-3 gap-4 w-full max-w-2xl bg-slate-50 p-4 rounded-xl shadow-sm"
                        style={{ width: '100%', minWidth: 0 }}
                    >
                        {MONTH_NAMES.map((month, idx) => {
                            const code = MONTH_CODES[idx];
                            const value = user.payments[code]?.trim();
                            const isCurrent = idx === currentMonthIndex;
                            let paid = false, date = '', amount = '', method = '';
                            if (value && value !== '' && value.toLowerCase() !== 'due') {
                                paid = true;
                                const parts = value.replace(/^paid-/, '').split('-');
                                date = formatDisplayDate(parts.slice(0, 3).join('-'));
                                amount = parts[3] || '';
                                method = parts[4] || '';
                            }
                            return (
                                <div
                                    key={code}
                                    className={`flex flex-col items-center justify-center px-2 py-3 rounded-lg transition text-base relative ${paid ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'} ${isCurrent ? 'ring-2 ring-blue-300 bg-blue-50/60' : ''}`}
                                    style={{ minWidth: 0, wordBreak: 'break-word' }}
                                >
                                    <span className="text-xs text-slate-500 mb-1 font-medium flex items-center gap-1">
                                        {isCurrent && (
                                            <svg className="w-3.5 h-3.5 text-blue-400 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <rect x="3" y="4" width="18" height="18" rx="2" fill="#e0edff" />
                                                <path d="M8 2v4M16 2v4M3 10h18" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        )}
                                        {month}
                                    </span>
                                    {paid ? (
                                        <div className="flex flex-col items-center">
                                            <span className="font-semibold">Paid</span>
                                            <span className="text-xs text-slate-500">{date}</span>
                                            <span className="text-xs">৳{amount}</span>
                                            <span className="text-xs capitalize">{method}</span>
                                        </div>
                                    ) : (
                                        <span className="font-semibold">Due</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {/* Notes */}
            {user.notes && (
                <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
                    <span className="font-semibold">Notes:</span> {user.notes}
                </div>
            )}
        </div>
    );
};

export default UserDetails;