import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, CreditCard, MapPin, User } from "lucide-react";

export default function CourseCheckout() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full">
        {/* Left Section - Billing & Shipping */}
        <Card className="shadow-lg rounded-2xl p-4">
          <CardContent className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6" /> Billing Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="First Name" className="rounded-xl p-3" />
              <Input placeholder="Last Name" className="rounded-xl p-3" />
            </div>
            <Input placeholder="Email Address" className="rounded-xl p-3" />
            <Input placeholder="Phone Number" className="rounded-xl p-3" />

            <h2 className="text-2xl font-bold flex items-center gap-2 mt-6">
              <MapPin className="w-6 h-6" /> Shipping Address
            </h2>

            <Input placeholder="Street Address" className="rounded-xl p-3" />
            <Input placeholder="City" className="rounded-xl p-3" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="State" className="rounded-xl p-3" />
              <Input placeholder="Postal Code" className="rounded-xl p-3" />
            </div>
          </CardContent>
        </Card>

        {/* Right Section - Order Summary */}
        <Card className="shadow-lg rounded-2xl p-4 h-fit">
          <CardContent className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" /> Order Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-lg font-medium">
                <span>Subtotal</span>
                <span>₹1499</span>
              </div>
              <div className="flex justify-between text-lg font-medium">
                <span>Shipping</span>
                <span>₹49</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-3">
                <span>Total</span>
                <span>₹1548</span>
              </div>
            </div>

            <h2 className="text-xl font-semibold flex items-center gap-2 mt-4">
              <CreditCard className="w-5 h-5" /> Payment Method
            </h2>

            {/* Razorpay Checkout Button */}
            <div className="space-y-3">
              <Button
                className="w-full rounded-xl py-6 text-lg"
                onClick={() => {
                  const options = {
                    key: "YOUR_RAZORPAY_KEY",
                    amount: 1548 * 100,
                    currency: "INR",
                    name: "Your Store",
                    description: "Order Payment",
                    handler: (response) => {
                      console.log(response);
                    },
                    prefill: {
                      name: "",
                      email: "",
                      contact: "",
                    },
                    theme: { color: "#6366f1" },
                  };
                  const razor = new window.Razorpay(options);
                  razor.open();
                }}
              >
                Pay with Razorpay
              </Button>

              <Button variant="outline" className="w-full rounded-xl py-6 text-lg">
                Cash on Delivery
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
