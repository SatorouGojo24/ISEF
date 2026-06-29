import { PayPalButtons } from "@paypal/react-paypal-js";

export const PayPalButton = () => {
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  return (
  
    <div className="w-full max-w-[250px] mx-auto mt-4 relative z-0">
      <PayPalButtons
        createOrder={async () => {
          const response = await fetch(`${apiUrl}/api/payment/create-order`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}` 
            },
          });
          
          if (!response.ok) {
             const errorData = await response.json();
             console.error("Error al crear la orden:", errorData);
             return ""; 
          }

          const order = await response.json();
          return order.id; 
        }}
        onApprove={async (data) => {
          console.log("Pago exitoso:", data);
          alert("¡Gracias por tu apoyo al proyecto!");
        }}
        style={{ layout: "horizontal", color: "blue", shape: "rect" }}
      />
    </div>
  );
};