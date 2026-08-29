type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product: { name: string };
};

export default function Receipt({
  orderNumber,
  tableName,
  waiterName,
  date,
  items,
  total,
  totalPaid,
}: {
  orderNumber: string;
  tableName: string;
  waiterName: string;
  date: string;
  items: OrderItem[];
  total: number;
  totalPaid: number;
}) {
  return (
    <div className="print-receipt text-black">
      <div className="text-center">
        <p className="font-bold">Bar Management System</p>
        <p className="text-xs">Receipt</p>
      </div>
      <div className="mt-3 text-xs">
        <p>Order: {orderNumber}</p>
        <p>Table: {tableName}</p>
        <p>Waiter: {waiterName}</p>
        <p>Date: {date}</p>
      </div>
      <div className="mt-3 border-t border-black pt-2 text-xs">
        {items.map((item) => (
          <div key={item.id} className="mb-1 flex justify-between">
            <span>
              {item.product.name} x{item.quantity}
            </span>
            <span>{item.total.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 border-t border-black pt-2 text-xs">
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>{total.toLocaleString()} UGX</span>
        </div>
        <div className="flex justify-between">
          <span>Paid</span>
          <span>{totalPaid.toLocaleString()} UGX</span>
        </div>
      </div>
      <p className="mt-3 text-center text-xs">Thank you!</p>
    </div>
  );
}
