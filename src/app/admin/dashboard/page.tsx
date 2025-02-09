"use client";
import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import Swal from "sweetalert2";
import ProtectedRoute from "@/app/component/ProtectedRoute";
import { motion, AnimatePresence } from "framer-motion";

interface Order {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  total: number;
  discount: number;
  orderDate: string;
  status: string | null;
  cartItems: { productName: string; image: string }[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    client
      .fetch(
        `*[_type == "order"]{
          _id,
          firstName,
          lastName,
          phone,
          email,
          address,
          city,
          zipCode,
          total,
          discount,
          orderDate,
          status,
          cartItems[]->{
            productName,
            image
          }
        }`
      )
      .then((data) => setOrders(data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const filteredOrders =
    filter === "All" ? orders : orders.filter((order) => order.status === filter);

  const toggleOrderDetails = (orderId: string) => {
    setSelectedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleDelete = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await client.delete(orderId);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      Swal.fire("Deleted!", "Your order has been deleted.", "success");
    } catch (error) {
      console.error("Error deleting order:", error);
      Swal.fire("Error!", "Something went wrong while deleting.", "error");
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await client
        .patch(orderId)
        .set({ status: newStatus })
        .commit();
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      if (newStatus === "dispatch") {
        Swal.fire("Dispatch", "The order is now dispatched.", "success");
      } else if (newStatus === "success") {
        Swal.fire("Success", "The order has been completed.", "success");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire("Error!", "Something went wrong while updating the status.", "error");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <nav className="bg-red-600 text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
              <h2 className="text-2xl font-bold font-['Inter'] tracking-tight">
                Admin Dashboard
              </h2>
              <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
                {["All", "pending", "dispatch", "success"].map((status) => (
                  <button
                    key={status}
                    className={`px-4 py-2 rounded-lg transition-all text-sm font-medium
                      ${
                        filter === status
                          ? "bg-white text-red-600 shadow-md"
                          : "bg-red-500 hover:bg-red-700"
                      }`}
                    onClick={() => setFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Orders Table */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden ">
            <table className="w-full min-w-[600px]">
              <thead className="bg-red-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-red-600 hidden md:table-cell">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-red-600">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-red-600 hidden sm:table-cell">
                    Address
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-red-600">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-red-600">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-red-600">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-red-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr
                      className="hover:bg-red-50 cursor-pointer transition-colors"
                      onClick={() => toggleOrderDetails(order._id)}
                    >
                      <td className="px-6 py-4 text-sm hidden md:table-cell">
                        <span className="font-mono text-gray-500">
                          #{order._id.slice(-6)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 font-medium">
                              {order.firstName[0]}
                              {order.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.firstName} {order.lastName}
                            </p>
                            <p className="text-sm text-gray-500 sm:hidden">
                              {order.city}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                        {order.address}, {order.city}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.orderDate).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${order.total ? order.total.toFixed(2) : "0.00"}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status || ""}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                          className={`text-sm px-3 py-1 rounded-full border ${
                            order.status === "pending"
                              ? "border-red-200 bg-red-100 text-red-700"
                              : order.status === "dispatch"
                              ? "border-amber-200 bg-amber-100 text-amber-700"
                              : "border-emerald-200 bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="dispatch">Dispatch</option>
                          <option value="success">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(order._id);
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="sr-only">Delete</span>
                        </button>
                      </td>
                    </tr>

                    <AnimatePresence>
                      {selectedOrderId === order._id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-gray-50"
                        >
                          <td colSpan={7} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h3 className="text-sm font-semibold text-red-600 mb-2">
                                  Contact Information
                                </h3>
                                <dl className="grid grid-cols-2 gap-4">
                                  <div>
                                    <dt className="text-xs text-gray-500">
                                      Phone
                                    </dt>
                                    <dd className="text-sm text-gray-900">
                                      {order.phone}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="text-xs text-gray-500">
                                      Email
                                    </dt>
                                    <dd className="text-sm text-gray-900 break-all">
                                      {order.email}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="text-xs text-gray-500">
                                      ZIP Code
                                    </dt>
                                    <dd className="text-sm text-gray-900">
                                      {order.zipCode}
                                    </dd>
                                  </div>
                                </dl>
                              </div>

                              <div>
                                <h3 className="text-sm font-semibold text-red-600 mb-2">
                                  Order Items
                                </h3>
                                <div className="space-y-3">
                                  {order.cartItems.map((item, index) => (
                                    <div
                                      key={`${order._id}-${index}`}
                                      className="flex items-center gap-4"
                                    >
                                      {item.image && (
                                        <div className="relative h-12 w-12 rounded-lg overflow-hidden border">
                                          <Image
                                            src={urlFor(item.image).url()}
                                            alt={item.productName}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                      )}
                                      <span className="text-sm font-medium text-gray-900">
                                        {item.productName}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}